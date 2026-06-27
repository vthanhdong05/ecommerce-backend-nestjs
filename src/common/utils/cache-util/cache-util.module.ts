import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheEnvs } from './cache-util.const';
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get<string>(CacheEnvs.REDIS_HOST, 'localhost'),
            port: configService.get<number>(CacheEnvs.REDIS_PORT, 6379),
          },
          ttl: configService.get<number>(CacheEnvs.CACHE_INTERNAL_TTL, 60000),
        }),
      }),
    }),
  ],
})
export class CacheUtilModule {}
