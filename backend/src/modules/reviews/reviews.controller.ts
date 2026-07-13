import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  create(
    @CurrentUser() user: JwtUser,
    @Body()
    body: {
      productId: string;
      orderId?: string;
      rating: number;
      title?: string;
      body: string;
    },
  ) {
    return this.reviewsService.create(user.sub, body);
  }

  @Public()
  @Get('product/:productId')
  findByProduct(
    @Param('productId') productId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.findByProduct(productId, +page, +limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/approve')
  @ApiBearerAuth('JWT-auth')
  approve(@Param('id') id: string) {
    return this.reviewsService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
