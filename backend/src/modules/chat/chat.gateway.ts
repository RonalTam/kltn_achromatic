import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatAIService } from './chat-ai.service';
import {
  StartChatDto,
  SendMessageDto,
  RequestStaffDto,
  StaffJoinDto,
  StaffMessageDto,
  EndChatDto,
  TypingDto,
} from './dto/chat.dto';
import { ChatMessageSender } from '@prisma/client';

// Staff room prefix — all staff socket connections join this room
const STAFF_ROOM = 'staff:room';

@WebSocketGateway({
  cors: {
    origin: '*', // restrict in production via ConfigService
    credentials: true,
  },
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Map: socketId → { sessionId?, staffId? }
  private readonly socketMeta = new Map<
    string,
    { sessionId?: string; staffId?: string }
  >();

  constructor(
    private readonly chatService: ChatService,
    private readonly chatAIService: ChatAIService,
  ) {}

  afterInit() {
    this.logger.log('✅ ChatGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
    this.socketMeta.set(client.id, {});
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
    this.socketMeta.delete(client.id);
  }

  // ─── Client Events ─────────────────────────────────────────────

  /**
   * Customer starts a new chat session
   * Payload: { guestId?: string }
   */
  @SubscribeMessage('chat:start')
  async handleStart(
    @MessageBody() dto: StartChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // userId from socket auth (JWT handshake) or undefined for guests
      const userId = client.handshake.auth?.userId as string | undefined;
      const session = await this.chatService.createSession(
        userId,
        dto.guestId,
      );

      // Track session for this socket
      this.socketMeta.set(client.id, { sessionId: session.id });

      // Join a room dedicated to this session
      await client.join(`session:${session.id}`);

      // Welcome message from system
      const systemMsg = await this.chatService.saveMessage(
        session.id,
        ChatMessageSender.SYSTEM,
        'Xin chào! Mình là Minh — nhân viên tư vấn của ACHROMATIC. Bạn đang tìm mẫu trang phục hay cần tư vấn gì hôm nay ạ? 😊',
      );

      client.emit('chat:session_created', {
        sessionId: session.id,
        message: systemMsg,
      });
    } catch (error) {
      this.logger.error('chat:start error', error);
      client.emit('chat:error', { message: 'Không thể tạo phiên chat' });
    }
  }

  /**
   * Customer sends a message
   * Payload: { sessionId, content }
   */
  @SubscribeMessage('chat:message')
  async handleMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const session = await this.chatService.getSession(dto.sessionId);

      // Save user message
      const userMsg = await this.chatService.saveMessage(
        dto.sessionId,
        ChatMessageSender.USER,
        dto.content,
      );

      // Emit user message to everyone in session room (so staff sees it too)
      this.server
        .to(`session:${dto.sessionId}`)
        .emit('chat:message_received', userMsg);

      // If staff is handling → don't call AI, just relay to staff dashboard
      if (session.status === 'STAFF_HANDLING') {
        this.server
          .to(STAFF_ROOM)
          .emit('staff:customer_message', {
            sessionId: dto.sessionId,
            message: userMsg,
          });
        return;
      }

      // Bot mode — call Gemini
      const history = await this.chatService.getHistory(dto.sessionId, 10);
      // Exclude the message we just saved to avoid sending it as context again
      const historyWithoutLast = history.slice(0, -1);

      // Show typing indicator
      client.emit('chat:bot_typing', { sessionId: dto.sessionId });

      // Prefer userId from message payload (always up-to-date) over socket handshake auth (may be stale)
      const userId =
        dto.userId ?? (client.handshake.auth?.userId as string | undefined);
      const aiReply = await this.chatAIService.generateReply(
        dto.content,
        historyWithoutLast,
        userId,
      );

      const botMsg = await this.chatService.saveMessage(
        dto.sessionId,
        ChatMessageSender.BOT,
        aiReply,
      );

      client.emit('chat:bot_reply', botMsg);
    } catch (error) {
      this.logger.error('chat:message error', error);
      client.emit('chat:error', { message: 'Không thể gửi tin nhắn' });
    }
  }

  /**
   * Customer clicks "Gặp nhân viên" button
   * Payload: { sessionId }
   */
  @SubscribeMessage('chat:request_staff')
  async handleRequestStaff(
    @MessageBody() dto: RequestStaffDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.requestStaff(dto.sessionId);

      // Save system message in chat
      const sysMsg = await this.chatService.saveMessage(
        dto.sessionId,
        ChatMessageSender.SYSTEM,
        'Bạn đã yêu cầu gặp nhân viên tư vấn. Vui lòng đợi trong giây lát, nhân viên sẽ tham gia ngay!',
      );
      client.emit('chat:system_message', sysMsg);

      // Get session info to send to staff dashboard
      const session = await this.chatService.getSession(dto.sessionId);

      // Notify all staff about new request
      this.server.to(STAFF_ROOM).emit('staff:new_request', {
        session,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error('chat:request_staff error', error);
      client.emit('chat:error', { message: 'Không thể gửi yêu cầu' });
    }
  }

  /**
   * Customer sends typing indicator
   */
  @SubscribeMessage('chat:typing')
  async handleTyping(
    @MessageBody() dto: TypingDto,
    @ConnectedSocket() client: Socket,
  ) {
    // Forward typing to staff room for this session
    this.server.to(STAFF_ROOM).emit('staff:customer_typing', {
      sessionId: dto.sessionId,
      isTyping: dto.isTyping ?? true,
    });
  }

  /**
   * Customer ends the chat
   */
  @SubscribeMessage('chat:end')
  async handleEnd(
    @MessageBody() dto: EndChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.closeSession(dto.sessionId);
      const sysMsg = await this.chatService.saveMessage(
        dto.sessionId,
        ChatMessageSender.SYSTEM,
        'Phiên chat đã kết thúc. Cảm ơn bạn đã liên hệ với ACHROMATIC!',
      );
      this.server
        .to(`session:${dto.sessionId}`)
        .emit('chat:session_closed', sysMsg);
      this.server.to(STAFF_ROOM).emit('staff:session_closed', {
        sessionId: dto.sessionId,
      });
    } catch (error) {
      this.logger.error('chat:end error', error);
    }
  }

  // ─── Staff Events ──────────────────────────────────────────────

  /**
   * Staff member joins the staff room to receive notifications
   * Payload: { staffId: string }
   */
  @SubscribeMessage('staff:connect')
  async handleStaffConnect(
    @MessageBody() data: { staffId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(STAFF_ROOM);
    this.socketMeta.set(client.id, { staffId: data.staffId });
    this.logger.log(`Staff ${data.staffId} joined staff room`);
    client.emit('staff:connected', { message: 'Đã kết nối với hệ thống chat' });
  }

  /**
   * Staff accepts a session request
   * Payload: { sessionId, staffId }
   */
  @SubscribeMessage('staff:join_session')
  async handleStaffJoin(
    @MessageBody() dto: StaffJoinDto & { staffId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.assignStaff(dto.sessionId, dto.staffId);
      await client.join(`session:${dto.sessionId}`);

      // Save system message
      const sysMsg = await this.chatService.saveMessage(
        dto.sessionId,
        ChatMessageSender.SYSTEM,
        'Nhân viên tư vấn đã tham gia cuộc trò chuyện. Xin chào bạn!',
      );

      // Notify customer
      this.server
        .to(`session:${dto.sessionId}`)
        .emit('chat:staff_joined', { sessionId: dto.sessionId, message: sysMsg });

      // Notify other staff that session is taken
      this.server.to(STAFF_ROOM).emit('staff:session_assigned', {
        sessionId: dto.sessionId,
        staffId: dto.staffId,
      });
    } catch (error) {
      this.logger.error('staff:join_session error', error);
      client.emit('chat:error', { message: 'Không thể tham gia phiên chat' });
    }
  }

  /**
   * Staff sends a message to customer
   * Payload: { sessionId, content }
   */
  @SubscribeMessage('staff:send_message')
  async handleStaffMessage(
    @MessageBody() dto: StaffMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const staffMsg = await this.chatService.saveMessage(
        dto.sessionId,
        ChatMessageSender.STAFF,
        dto.content,
      );

      // Send to customer in session room
      this.server
        .to(`session:${dto.sessionId}`)
        .emit('chat:staff_reply', staffMsg);

      // Echo to all staff in staff room too (for visibility)
      this.server.to(STAFF_ROOM).emit('staff:message_sent', {
        sessionId: dto.sessionId,
        message: staffMsg,
      });
    } catch (error) {
      this.logger.error('staff:send_message error', error);
      client.emit('chat:error', { message: 'Không thể gửi tin nhắn' });
    }
  }

  /**
   * Staff sends typing indicator to customer
   */
  @SubscribeMessage('staff:typing')
  async handleStaffTyping(
    @MessageBody() dto: TypingDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.server
      .to(`session:${dto.sessionId}`)
      .emit('chat:typing', {
        sender: 'staff',
        isTyping: dto.isTyping ?? true,
      });
  }

  /**
   * Staff closes a session
   */
  @SubscribeMessage('staff:close_session')
  async handleStaffClose(
    @MessageBody() dto: EndChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.closeSession(dto.sessionId);
      const sysMsg = await this.chatService.saveMessage(
        dto.sessionId,
        ChatMessageSender.SYSTEM,
        'Nhân viên đã kết thúc phiên tư vấn. Cảm ơn bạn đã liên hệ ACHROMATIC!',
      );
      this.server
        .to(`session:${dto.sessionId}`)
        .emit('chat:session_closed', sysMsg);
      this.server.to(STAFF_ROOM).emit('staff:session_closed', {
        sessionId: dto.sessionId,
      });
    } catch (error) {
      this.logger.error('staff:close_session error', error);
    }
  }

  // ─── HTTP-triggered methods (called by REST controller) ────────

  emitStaffNewRequest(sessionData: unknown) {
    this.server.to(STAFF_ROOM).emit('staff:new_request', sessionData);
  }
}
