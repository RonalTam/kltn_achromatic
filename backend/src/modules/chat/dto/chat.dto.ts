import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class StartChatDto {
  @IsOptional()
  @IsString()
  guestId?: string; // client-generated guest id for anonymous users
}

export class SendMessageDto {
  @IsString()
  sessionId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsString()
  userId?: string; // pass from client for order lookup when socket auth may be stale
}

export class RequestStaffDto {
  @IsString()
  sessionId: string;
}

export class StaffJoinDto {
  @IsString()
  sessionId: string;
}

export class StaffMessageDto {
  @IsString()
  sessionId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}

export class EndChatDto {
  @IsString()
  sessionId: string;
}

export class TypingDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  isTyping?: boolean;
}
