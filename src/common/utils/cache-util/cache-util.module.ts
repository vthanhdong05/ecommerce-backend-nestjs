import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheHelperService } from './cache-helper.service';
import { CacheEnvs } from './cache-util.const';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>(CacheEnvs.CACHE_INTERNAL_TTL, 60000);
        const redisUrl = configService.get<string>(CacheEnvs.REDIS_URL);

        const connectionString = redisUrl
          ? redisUrl
          : `redis://${configService.get<string>(CacheEnvs.REDIS_HOST, 'localhost')}:${configService.get<number>(CacheEnvs.REDIS_PORT, 6379)}`;

        return {
          stores: [new KeyvRedis(connectionString)],
          ttl,
        };
      },
    }),
  ],
  providers: [CacheHelperService],
  exports: [CacheHelperService],
})
export class CacheUtilModule {}
