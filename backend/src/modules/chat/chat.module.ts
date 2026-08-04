import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ChatService } from './chat.service';
import { ChatAIService } from './chat-ai.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ChatService, ChatAIService, ChatGateway],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
