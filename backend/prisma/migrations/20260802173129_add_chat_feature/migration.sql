-- CreateEnum
CREATE TYPE "ChatSessionStatus" AS ENUM ('BOT_HANDLING', 'STAFF_REQUESTED', 'STAFF_HANDLING', 'CLOSED');

-- CreateEnum
CREATE TYPE "ChatMessageSender" AS ENUM ('USER', 'BOT', 'STAFF', 'SYSTEM');

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,
    "staffId" TEXT,
    "status" "ChatSessionStatus" NOT NULL DEFAULT 'BOT_HANDLING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sender" "ChatMessageSender" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_sessions_userId_idx" ON "chat_sessions"("userId");

-- CreateIndex
CREATE INDEX "chat_sessions_status_idx" ON "chat_sessions"("status");

-- CreateIndex
CREATE INDEX "chat_sessions_createdAt_idx" ON "chat_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
