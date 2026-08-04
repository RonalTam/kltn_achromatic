import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  ChatMessageSender,
  ChatSessionStatus,
  Prisma,
} from '@prisma/client';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Session CRUD ──────────────────────────────────────────────

  async createSession(userId?: string, guestId?: string) {
    return this.prisma.chatSession.create({
      data: {
        userId: userId ?? null,
        guestId: guestId ?? null,
        status: ChatSessionStatus.BOT_HANDLING,
      },
    });
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Chat session not found');
    return session;
  }

  async listSessionsByStatus(status?: ChatSessionStatus, page = 1, limit = 30) {
    const where: Prisma.ChatSessionWhereInput = status ? { status } : {};
    const [total, sessions] = await Promise.all([
      this.prisma.chatSession.count({ where }),
      this.prisma.chatSession.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // preview last message
          },
        },
      }),
    ]);
    return { data: sessions, meta: { total, page, limit } };
  }

  // ─── Message CRUD ─────────────────────────────────────────────

  async saveMessage(
    sessionId: string,
    sender: ChatMessageSender,
    content: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        sender,
        content,
        metadata: metadata
          ? (JSON.parse(JSON.stringify(metadata)) as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  async getHistory(sessionId: string, limit = 20) {
    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  // ─── Status Transitions ───────────────────────────────────────

  async requestStaff(sessionId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: ChatSessionStatus.STAFF_REQUESTED, updatedAt: new Date() },
    });
  }

  async assignStaff(sessionId: string, staffId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: ChatSessionStatus.STAFF_HANDLING,
        staffId,
        updatedAt: new Date(),
      },
    });
  }

  async closeSession(sessionId: string) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: ChatSessionStatus.CLOSED,
        closedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // ─── Stats for Admin ──────────────────────────────────────────

  async getStats() {
    const [waiting, active, closed] = await Promise.all([
      this.prisma.chatSession.count({
        where: { status: ChatSessionStatus.STAFF_REQUESTED },
      }),
      this.prisma.chatSession.count({
        where: { status: ChatSessionStatus.STAFF_HANDLING },
      }),
      this.prisma.chatSession.count({
        where: { status: ChatSessionStatus.CLOSED },
      }),
    ]);
    return { waiting, active, closed };
  }
}
