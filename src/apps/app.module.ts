import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { CatchEverythingFilter } from 'src/catch-everything/catch-everything.filter';
import { LoggerModule } from 'src/common/logger/logger.module';
import { LoggingInterceptor } from 'src/common/logger/logging.interceptor';
import { ApiUtilModule } from 'src/common/utils/api-util/api-util.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZodExceptionFilter } from 'src/catch-everything/zod-exception/zod-exception.filter';

@Module({
  imports: [LoggerModule, ApiUtilModule],
  controllers: [AppController],
  providers: [
    AppService,
    ZodExceptionFilter,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
