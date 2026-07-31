import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { NewsletterEmailDto } from './dto/newsletter-email.dto';
import { NewsletterService } from './newsletter.service';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Public()
  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe an email address to the newsletter' })
  subscribe(@Body() dto: NewsletterEmailDto) {
    return this.newsletterService.subscribe(dto.email);
  }

  @Public()
  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe an email address from the newsletter' })
  unsubscribe(@Body() dto: NewsletterEmailDto) {
    return this.newsletterService.unsubscribe(dto.email);
  }
}
