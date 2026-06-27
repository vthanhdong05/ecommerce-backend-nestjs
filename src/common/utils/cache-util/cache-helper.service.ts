// cache-helper.service.ts
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class CacheHelperService implements OnModuleInit {
  private readonly logger = new Logger(CacheHelperService.name);
  private keyvRedisStore: any;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  onModuleInit() {
    const keyvInstance = (this.cacheManager as any).stores?.[0];
    this.keyvRedisStore = keyvInstance?._store; // KeyvRedis instance

    if (!this.keyvRedisStore) {
      this.logger.warn('Redis client not found — check CacheModule configuration');
    } else {
      this.logger.log('Redis client initialized successfully');
    }
  }

  async ping(): Promise<boolean> {
    try {
      // Dùng cache-manager set/get để test thay vì raw ping
      const testKey = '__health_check__';
      await this.cacheManager.set(testKey, 'ok', 5000);
      const result = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);
      return result === 'ok';
    } catch (error) {
      this.logger.error('Redis ping failed:', error);
      return false;
    }
  }

  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.keyvRedisStore) return;
    try {
      // KeyvRedis có method keys() hoặc dùng iterator
      const keys: string[] = (await this.keyvRedisStore.keys?.(pattern)) ?? [];
      if (keys.length > 0) {
        await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
      }
    } catch (error) {
      this.logger.error(`deleteByPattern(${pattern}) failed:`, error);
    }
  }
}
