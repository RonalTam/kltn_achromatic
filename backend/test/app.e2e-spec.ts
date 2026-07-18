import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('AppModule (e2e smoke)', () => {
  let app: INestApplication<App>;

  const prisma = {
    product: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

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

  it('boots the complete module graph and serves the public products API', async () => {
    await request(app.getHttpServer())
      .get('/api/products')
      .query({ search: 'linen', page: 1, limit: 5 })
      .expect(200)
      .expect({
        data: [],
        matchCount: 0,
        meta: {
          total: 0,
          page: 1,
          limit: 5,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        isActive: true,
        OR: expect.arrayContaining([
          { name: { contains: 'linen', mode: 'insensitive' } },
          { sku: { contains: 'linen', mode: 'insensitive' } },
        ]),
      }),
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
