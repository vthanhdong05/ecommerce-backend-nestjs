import KeyvRedis from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheEnvs } from './cache-util.const';
import { CacheHelperService } from './cache-helper.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>(CacheEnvs.REDIS_HOST, 'localhost');
        const port = configService.get<number>(CacheEnvs.REDIS_PORT, 6379);
        const ttl = configService.get<number>(CacheEnvs.CACHE_INTERNAL_TTL, 60000);
        return {
          stores: [new KeyvRedis(`redis://${host}:${port}`)],
          ttl,
        };
      },
    }),
  ],
  providers: [CacheHelperService],
  exports: [CacheHelperService], // 👈 export để các module khác dùng
})
export class CacheUtilModule {}
