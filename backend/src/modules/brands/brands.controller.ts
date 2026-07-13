import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BrandsService } from './brands.service';

@ApiTags('brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public() @Get() findAll() {
    return this.brandsService.findAll();
  }
  @Public() @Get(':slug') findOne(@Param('slug') slug: string) {
    return this.brandsService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @ApiBearerAuth('JWT-auth')
  create(
    @Body()
    body: {
      name: string;
      slug: string;
      logoUrl?: string;
      description?: string;
      website?: string;
    },
  ) {
    return this.brandsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; logoUrl: string; isActive: boolean }>,
  ) {
    return this.brandsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
