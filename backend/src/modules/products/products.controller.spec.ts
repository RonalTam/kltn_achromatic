import { INestApplication, Injectable, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SortBy } from './dto/product-query.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const JWT_SECRET = 'controller-integration-test-secret';

@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: { sub: string; email: string; role: Role }) {
    return payload;
  }
}

describe('ProductsController (HTTP integration)', () => {
  let app: INestApplication<App>;

  const productsService = {
    findAll: jest.fn(),
    getFilterOptions: jest.fn(),
    findById: jest.fn(),
    findRelated: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [ProductsController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        TestJwtStrategy,
        { provide: ProductsService, useValue: productsService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/products transforms filters and returns the product list', async () => {
    const result = {
      data: [{ id: 'product-1', slug: 'linen-shirt' }],
      meta: { total: 1, page: 2, limit: 5, totalPages: 1 },
    };
    productsService.findAll.mockResolvedValue(result);

    await request(app.getHttpServer())
      .get('/api/products')
      .query({
        search: 'linen',
        minPrice: '100000',
        sizes: 'M,L',
        featured: 'true',
        sortBy: SortBy.PRICE_ASC,
        page: '2',
        limit: '5',
      })
      .expect(200)
      .expect(result);

    expect(productsService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'linen',
        minPrice: 100000,
        sizes: ['M', 'L'],
        featured: true,
        sortBy: SortBy.PRICE_ASC,
        page: 2,
        limit: 5,
      }),
    );
  });

  it('GET /api/products/:slug returns product detail', async () => {
    const product = {
      id: 'product-1',
      slug: 'linen-shirt',
      name: 'Linen Shirt',
    };
    productsService.findOne.mockResolvedValue(product);

    await request(app.getHttpServer())
      .get('/api/products/linen-shirt')
      .expect(200)
      .expect(product);

    expect(productsService.findOne).toHaveBeenCalledWith('linen-shirt');
  });

  it('rejects invalid product query DTO values with HTTP 400', async () => {
    await request(app.getHttpServer())
      .get('/api/products')
      .query({ page: '0', limit: '101', sortBy: 'unsupported' })
      .expect(400);

    expect(productsService.findAll).not.toHaveBeenCalled();
  });

  it('returns HTTP 401 for a protected product write without a JWT', async () => {
    await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: 'Protected product' })
      .expect(401);

    expect(productsService.create).not.toHaveBeenCalled();
  });
});
