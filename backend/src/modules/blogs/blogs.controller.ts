import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role, BlogStatus } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BlogsService } from './blogs.service';

@ApiTags('blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.blogsService.findAll(+page, +limit, category, search);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogsService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @Post()
  @ApiBearerAuth('JWT-auth')
  create(
    @Body()
    body: {
      title: string;
      slug: string;
      content: string;
      excerpt?: string;
      coverImageUrl?: string;
      status?: BlogStatus;
    },
  ) {
    return this.blogsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{ title: string; content: string; status: BlogStatus }>,
  ) {
    return this.blogsService.update(id, body);
  }
}
