import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List products with filtering, sorting, and pagination',
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('filters')
  @ApiOperation({
    summary:
      'Get available filter options (sizes, colors, brands, price range)',
  })
  getFilters(@Query('category') category?: string) {
    return this.productsService.getFilterOptions(category);
  }

  @Public()
  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  async findRelated(@Param('id') id: string) {
    const product = await this.productsService.findById(id);
    return this.productsService.findRelated(product.id, product.categoryId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product detail by slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Create a new product' })
  create(@Body() body: Record<string, unknown>) {
    return this.productsService.create(body as never);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Update a product' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.productsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: '[Admin] Soft-delete a product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
