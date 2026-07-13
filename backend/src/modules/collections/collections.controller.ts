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
import { CollectionsService } from './collections.service';

@ApiTags('collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Public() @Get() findAll() {
    return this.collectionsService.findAll();
  }
  @Public() @Get(':slug') findOne(@Param('slug') slug: string) {
    return this.collectionsService.findOne(slug);
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
      description?: string;
      imageUrl?: string;
    },
  ) {
    return this.collectionsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{ name: string; isActive: boolean; isFeatured: boolean }>,
  ) {
    return this.collectionsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/products/:productId')
  @ApiBearerAuth('JWT-auth')
  addProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.collectionsService.addProduct(id, productId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id/products/:productId')
  @ApiBearerAuth('JWT-auth')
  removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.collectionsService.removeProduct(id, productId);
  }
}
