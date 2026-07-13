import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all categories with subcategories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findOne(slug);
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
    return this.categoriesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      description: string;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.categoriesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
