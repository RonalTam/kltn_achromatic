import './instrument';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  // Security
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(helmet.default());
  app.use(cookieParser());

  // Prevent Facebook crawler (facebookexternalhit) from consuming the one-time OAuth code
  // This happens when links are opened in Facebook/Messenger in-app browsers, 
  // where the bot pre-fetches the redirect URL for safety checks.
  app.use('/api/auth/facebook/callback', (req: any, res: any, next: any) => {
    const userAgent = req.headers['user-agent'] || '';
    if (userAgent.includes('facebookexternalhit') || userAgent.includes('Facebot')) {
      console.log('Blocked Facebook crawler from consuming OAuth code.');
      return res.status(200).send('OK'); // Return 200 so FB doesn't flag it as malicious
    }
    next();
  });

  // CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
    credentials: true,
  });

  // Global prefix & versioning
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({ type: VersioningType.URI });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger (only in non-production)
  if (
    nodeEnv !== 'production' ||
    configService.get<boolean>('SWAGGER_ENABLED')
  ) {
    const config = new DocumentBuilder()
      .setTitle(configService.get<string>('SWAGGER_TITLE', 'Achromatic API'))
      .setDescription(
        configService.get<string>(
          'SWAGGER_DESCRIPTION',
          'Achromatic Fashion REST API',
        ),
      )
      .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0'))
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .addCookieAuth('refreshToken')
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('products', 'Product catalog')
      .addTag('categories', 'Categories & subcategories')
      .addTag('brands', 'Brands')
      .addTag('cart', 'Shopping cart')
      .addTag('orders', 'Order management')
      .addTag('payments', 'Payments')
      .addTag('shipping', 'Shipping methods')
      .addTag('coupons', 'Discount coupons')
      .addTag('reviews', 'Product reviews')
      .addTag('wishlists', 'Wishlists')
      .addTag('banners', 'Banners & promotions')
      .addTag('collections', 'Product collections')
      .addTag('blogs', 'Blog content')
      .addTag('notifications', 'Notifications')
      .addTag('admin', 'Admin dashboard')
      .addTag('analytics', 'Analytics & reports')
      .addTag('newsletter', 'Newsletter subscriptions')
      .addTag('health', 'Service readiness')
      .build();

    const swaggerPath = configService.get<string>('SWAGGER_PATH', 'docs');
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/${swaggerPath}`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(
    `🚀 Achromatic API running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(`📖 Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
}

void bootstrap();
