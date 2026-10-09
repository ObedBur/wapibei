import * as dotenv from 'dotenv';
import * as path from 'path';
import * as dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), '.env.local')
];

console.log('[Bootstrap] Démarrage du script main.ts...');

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
  if (process.env.DATABASE_URL) {
    console.log(`[Bootstrap] DATABASE_URL chargée depuis ${envPath}`);
    break;
  }
}

if (!process.env.DATABASE_URL) {
  console.error('[Bootstrap] ERREUR : DATABASE_URL est absente de process.env');
} else {
  console.log('[Bootstrap] DATABASE_URL est présente.');
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
// 
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      logger: true,
      bodyLimit: 50 * 1024 * 1024,
    })
  );

  // ============ COOKIE PARSER ============
  await app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'wapibei_cookie_secret_change_in_prod',
    parseOptions: {},
  });

  // ============ PREFIXE GLOBAL ============
  // ============ PREFIXE GLOBAL ============
  app.setGlobalPrefix('api', {
  });

  // ============ FILTRE D'EXCEPTIONS GLOBAL ============
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ============ VALIDATION GLOBALE ============
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ============ CONFIGURATION CORS ============
  const isDev = process.env.NODE_ENV !== 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (isDev || process.env.SWAGGER_ENABLED === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('WapiBei API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true });
  }

  // Parser les origines autorisées
  const explicitOrigins = [
    ...frontendUrl.split(',').map(url => url.trim()),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  // Accepte les previews Vercel (*.vercel.app) dynamiquement
  const corsOrigin = isDev
    ? true
    : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return callback(null, true);
        const isVercel = /\.vercel\.app$/.test(origin);
        const isLocalNetwork = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin);
        
        if (isVercel || isLocalNetwork || explicitOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false); 
        }
      };

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // ============ SÉCURITÉ HTTP (Fastify version) ============
  // On place helmet APRÈS CORS pour éviter des conflits et on le desserre en dev
  await app.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });

  // ============ SHUTDOWN HOOKS ============
  app.enableShutdownHooks();

  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`WapiBei est en ligne sur http://localhost:${port}`);
  const accessExpiry = process.env.JWT_ACCESS_EXPIRATION || '1h (default)';
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRATION || '7d (default)';
  logger.log(`JWT Config: Access (${accessExpiry}), Refresh (${refreshExpiry})`);
}
bootstrap();