import { INestApplication, Injectable, ValidationPipe } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const JWT_SECRET = 'controller-integration-test-secret';

type TestJwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: TestJwtPayload): TestJwtPayload {
    return payload;
  }
}

describe('AuthController (HTTP integration)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const user = {
    id: 'user-1',
    email: 'customer@example.com',
    firstName: 'Test',
    lastName: 'Customer',
    role: Role.CUSTOMER,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: JWT_SECRET }),
      ],
      controllers: [AuthController],
      providers: [
        JwtAuthGuard,
        TestJwtStrategy,
        { provide: AuthService, useValue: authService },
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

  it('POST /api/auth/register validates and registers a customer', async () => {
    const dto = {
      email: user.email,
      password: 'StrongPass123',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: '+84901234567',
    };
    authService.register.mockResolvedValue({
      user,
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(dto)
      .expect(201);

    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(response.body).toEqual({ user, accessToken: 'access-token' });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('refreshToken=refresh-token'),
        expect.stringContaining('auth_status=1'),
      ]),
    );
  });

  it('POST /api/auth/login returns tokens with HTTP 200', async () => {
    const dto = { email: user.email, password: 'StrongPass123' };
    authService.login.mockResolvedValue({
      user,
      accessToken: 'login-access-token',
      refreshToken: 'login-refresh-token',
    });

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(dto)
      .expect(200);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(response.body).toEqual({
      user,
      accessToken: 'login-access-token',
    });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('refreshToken=login-refresh-token'),
      ]),
    );
  });

  it('rejects an invalid registration DTO with HTTP 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: 'weak',
        firstName: '',
        lastName: 'Customer',
      })
      .expect(400);
    const body = response.body as { message: string[] };

    expect(body.message).toEqual(
      expect.arrayContaining([
        'Invalid email address',
        'Password must be at least 8 characters',
      ]),
    );
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('rejects an invalid login DTO with HTTP 400', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'invalid', password: '' })
      .expect(400);

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('returns HTTP 401 from JwtAuthGuard without a bearer token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);

    expect(authService.getProfile).not.toHaveBeenCalled();
  });

  it('passes the verified JWT user to the protected profile route', async () => {
    const profile = { ...user, phone: '+84901234567' };
    const accessToken = jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    authService.getProfile.mockResolvedValue(profile);

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect(profile);

    expect(authService.getProfile).toHaveBeenCalledWith(user.id);
  });
});
