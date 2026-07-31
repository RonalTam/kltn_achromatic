import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class NewsletterEmailDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  @MaxLength(254)
  email: string;
}
