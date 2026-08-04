import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatSessionStatus } from '@prisma/client';

@ApiTags('chat')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /** Admin: list chat sessions */
  @Get('sessions')
  listSessions(
    @Query('status') status?: ChatSessionStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit = 30,
  ) {
    return this.chatService.listSessionsByStatus(status, page, limit);
  }

  /** Admin: get session details with messages */
  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.chatService.getSession(id);
  }

  /** Admin: get session message history */
  @Get('sessions/:id/messages')
  getMessages(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    return this.chatService.getHistory(id, limit);
  }

  /** Admin: dashboard stats */
  @Get('stats')
  getStats() {
    return this.chatService.getStats();
  }
}
