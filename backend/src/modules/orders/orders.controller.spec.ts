import { INestApplication, Injectable, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus, PaymentMethod, Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

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

describe('OrdersController (HTTP integration)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const ordersService = {
    createOrder: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    cancelByUser: jest.fn(),
    findByOrderNumber: jest.fn(),
    findAll: jest.fn(),
    updateStatus: jest.fn(),
  };

  const customer = {
    sub: 'user-1',
    email: 'customer@example.com',
    role: Role.CUSTOMER,
  };

  const admin = {
    sub: 'admin-1',
    email: 'admin@example.com',
    role: Role.ADMIN,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [OrdersController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        TestJwtStrategy,
        { provide: OrdersService, useValue: ordersService },
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
    jwtService = moduleFixture.get(JwtService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  function bearerToken(user = customer): string {
    return `Bearer ${jwtService.sign(user)}`;
  }

  function expiredBearerToken(): string {
    return `Bearer ${jwtService.sign(customer, { expiresIn: -1 })}`;
  }

  it('POST /api/orders/checkout creates an order for the JWT user', async () => {
    const dto = {
      addressId: 'address-1',
      shippingMethodId: 'shipping-1',
      paymentMethod: PaymentMethod.COD,
      couponCode: 'WELCOME10',
      notes: 'Call before delivery',
    };
    const order = {
      id: 'order-1',
      orderNumber: 'AC-TEST-0001',
      userId: customer.sub,
    };
    ordersService.createOrder.mockResolvedValue(order);

    await request(app.getHttpServer())
      .post('/api/orders/checkout')
      .set('Authorization', bearerToken())
      .send(dto)
      .expect(201)
      .expect(order);

    expect(ordersService.createOrder).toHaveBeenCalledWith(customer.sub, dto);
  });

  it.each([
    ['missing required fields', {}],
    [
      'an empty address ID',
      { addressId: '', paymentMethod: PaymentMethod.COD },
    ],
    [
      'an unsupported payment method',
      { addressId: 'address-1', paymentMethod: 'CASH' },
    ],
    [
      'an empty optional shipping method ID',
      {
        addressId: 'address-1',
        shippingMethodId: '',
        paymentMethod: PaymentMethod.COD,
      },
    ],
  ])('POST /api/orders/checkout rejects %s', async (_case, dto) => {
    await request(app.getHttpServer())
      .post('/api/orders/checkout')
      .set('Authorization', bearerToken())
      .send(dto)
      .expect(400);

    expect(ordersService.createOrder).not.toHaveBeenCalled();
  });

  it('GET /api/orders returns the authenticated customer orders', async () => {
    const result = {
      data: [{ id: 'order-1', orderNumber: 'AC-TEST-0001' }],
      meta: { total: 1, page: 2, limit: 5, totalPages: 1 },
    };
    ordersService.findByUser.mockResolvedValue(result);

    await request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', bearerToken())
      .query({ page: '2', limit: '5' })
      .expect(200)
      .expect(result);

    expect(ordersService.findByUser).toHaveBeenCalledWith(customer.sub, 2, 5);
  });

  it('GET /api/orders/:id scopes order detail to the JWT user', async () => {
    const order = { id: 'order-1', userId: customer.sub };
    ordersService.findOne.mockResolvedValue(order);

    await request(app.getHttpServer())
      .get('/api/orders/order-1')
      .set('Authorization', bearerToken())
      .expect(200)
      .expect(order);

    expect(ordersService.findOne).toHaveBeenCalledWith('order-1', customer.sub);
  });

  it('PATCH /api/orders/:id/cancel trims and forwards a bounded reason', async () => {
    const order = { id: 'order-1', status: OrderStatus.CANCELLED };
    ordersService.cancelByUser.mockResolvedValue(order);

    await request(app.getHttpServer())
      .patch('/api/orders/order-1/cancel')
      .set('Authorization', bearerToken())
      .send({ reason: '  Thay đổi nhu cầu  ' })
      .expect(200)
      .expect(order);

    expect(ordersService.cancelByUser).toHaveBeenCalledWith(
      'order-1',
      customer.sub,
      'Thay đổi nhu cầu',
    );
  });

  it('PATCH /api/orders/:id/cancel rejects an oversized reason', async () => {
    await request(app.getHttpServer())
      .patch('/api/orders/order-1/cancel')
      .set('Authorization', bearerToken())
      .send({ reason: 'x'.repeat(301) })
      .expect(400);

    expect(ordersService.cancelByUser).not.toHaveBeenCalled();
  });

  it('PATCH /api/orders/admin/:id/status updates status for an admin', async () => {
    const dto = {
      status: OrderStatus.CONFIRMED,
      note: 'Payment confirmed',
    };
    const order = { id: 'order-1', status: dto.status };
    ordersService.updateStatus.mockResolvedValue(order);

    await request(app.getHttpServer())
      .patch('/api/orders/admin/order-1/status')
      .set('Authorization', bearerToken(admin))
      .send(dto)
      .expect(200)
      .expect(order);

    expect(ordersService.updateStatus).toHaveBeenCalledWith(
      'order-1',
      dto.status,
      dto.note,
      admin.sub,
    );
  });

  it('PATCH /api/orders/admin/:id/status rejects an invalid status', async () => {
    await request(app.getHttpServer())
      .patch('/api/orders/admin/order-1/status')
      .set('Authorization', bearerToken(admin))
      .send({ status: 'NOT_A_STATUS' })
      .expect(400);

    expect(ordersService.updateStatus).not.toHaveBeenCalled();
  });

  it('GET /api/orders/admin/all rejects a customer role', async () => {
    await request(app.getHttpServer())
      .get('/api/orders/admin/all')
      .set('Authorization', bearerToken(customer))
      .expect(403);

    expect(ordersService.findAll).not.toHaveBeenCalled();
  });

  it('GET /api/orders/admin/all allows an admin role', async () => {
    const result = {
      data: [{ id: 'order-1', status: OrderStatus.PENDING }],
      meta: { total: 1, page: 2, limit: 5, totalPages: 1 },
    };
    ordersService.findAll.mockResolvedValue(result);

    await request(app.getHttpServer())
      .get('/api/orders/admin/all')
      .set('Authorization', bearerToken(admin))
      .query({ page: '2', limit: '5', status: OrderStatus.PENDING })
      .expect(200)
      .expect(result);

    expect(ordersService.findAll).toHaveBeenCalledWith(
      2,
      5,
      OrderStatus.PENDING,
    );
  });

  it.each([
    ['GET', 'list', () => request(app.getHttpServer()).get('/api/orders')],
    [
      'POST',
      'checkout',
      () => request(app.getHttpServer()).post('/api/orders/checkout').send({}),
    ],
  ])(
    'returns HTTP 401 for unauthenticated %s order %s',
    async (_method, _route, makeRequest) => {
      await makeRequest().expect(401);
    },
  );

  it.each([
    ['invalid', 'Bearer this-is-not-a-jwt'],
    ['expired', () => expiredBearerToken()],
  ])('returns HTTP 401 for an %s JWT', async (_case, authorization) => {
    const header =
      typeof authorization === 'function' ? authorization() : authorization;

    await request(app.getHttpServer())
      .get('/api/orders')
      .set('Authorization', header)
      .expect(401);
  });
});
