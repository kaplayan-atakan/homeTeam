import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';
import { SessionCacheStrategy } from './strategies/session-cache.strategy';
import { ApiCacheStrategy } from './strategies/api-cache.strategy';
import { RateLimitStrategy } from './strategies/rate-limit.strategy';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CacheInvalidateInterceptor } from './interceptors/cache-invalidate.interceptor';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6380),
        password: configService.get('REDIS_PASSWORD', 'redis123'),
        db: configService.get('REDIS_DB', 0),
        ttl: configService.get('CACHE_TTL', 300), // 5 dakika default
        max: configService.get('CACHE_MAX_ITEMS', 1000),
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    CacheService,
    SessionCacheStrategy,
    ApiCacheStrategy,
    RateLimitStrategy,
    CacheInterceptor,
    CacheInvalidateInterceptor,
  ],
  exports: [
    CacheService,
    SessionCacheStrategy,
    ApiCacheStrategy,
    RateLimitStrategy,
    CacheInterceptor,
    CacheInvalidateInterceptor,
    NestCacheModule,
  ],
})
export class CacheModule {}
