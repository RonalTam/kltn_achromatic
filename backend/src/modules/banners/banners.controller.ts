import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role, BannerPosition } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BannersService } from './banners.service';

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  findAll(@Query('position') position?: BannerPosition) {
    return this.bannersService.findAll(position);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @ApiBearerAuth('JWT-auth')
  create(
    @Body()
    body: {
      title: string;
      imageUrl: string;
      position?: BannerPosition;
      linkUrl?: string;
    },
  ) {
    return this.bannersService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{ title: string; isActive: boolean; sortOrder: number }>,
  ) {
    return this.bannersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
