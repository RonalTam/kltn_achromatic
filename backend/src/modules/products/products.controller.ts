import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
  )
  @ApiOperation({
    summary: 'List products with filtering, sorting, and pagination',
  })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('home-sections')
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  @ApiOperation({ summary: 'Get ordered products for homepage sections' })
  getHomeSections() {
    return this.productsService.getHomeSections();
  }

  @Public()
  @Get('filters')
  @Header(
    'Cache-Control',
    'public, max-age=120, s-maxage=600, stale-while-revalidate=1200',
  )
  @ApiOperation({
    summary:
      'Get available filter options (sizes, colors, brands, price range)',
  })
  getFilters(@Query('category') category?: string) {
    return this.productsService.getFilterOptions(category);
  }

  @Public()
  @Get(':id/related')
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  )
  @ApiOperation({ summary: 'Get related products' })
  async findRelated(@Param('id') id: string) {
    const product = await this.productsService.findById(id);
    return this.productsService.findRelated(product.id, product.categoryId);
  }

  @Public()
  @Get(':slug')
  @Header(
    'Cache-Control',
    'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
  )
  @ApiOperation({ summary: 'Get product detail by slug' })
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }
}
