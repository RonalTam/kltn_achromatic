import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(
    @CurrentUser() user: JwtUser,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.getUserNotifications(
      user.sub,
      +page,
      +limit,
    );
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: JwtUser) {
    return this.notificationsService.markAsRead(user.sub);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.sub, id);
  }
}
