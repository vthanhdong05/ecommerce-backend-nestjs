import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { CacheUtilModule } from '../utils/cache-util/cache-util.module';

@Module({
  imports: [TerminusModule, CacheUtilModule],
  controllers: [HealthController],
})
export class HealthModule {}
