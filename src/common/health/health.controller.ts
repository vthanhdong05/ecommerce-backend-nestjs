import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckError,
  HealthCheckService,
  HealthIndicatorResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { CacheHelperService } from '../utils/cache-util/cache-helper.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private cacheHelper: CacheHelperService,
  ) {}

  private async checkRedis(): Promise<HealthIndicatorResult> {
    const key = 'redis';
    const start = Date.now();
    try {
      const isAlive = await this.cacheHelper.ping();
      if (!isAlive) throw new Error('Redis did not respond');
      return { [key]: { status: 'up', responseTime: `${Date.now() - start}ms` } };
    } catch (error) {
      throw new HealthCheckError('Redis check failed', {
        [key]: {
          status: 'down',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.checkRedis(),
    ]);
  }
}
