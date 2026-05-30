import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { CatchEverythingFilter } from 'src/catch-everything/catch-everything.filter';
import { ZodExceptionFilter } from 'src/catch-everything/zod-exception/zod-exception.filter';
import { validate } from 'src/common/envs/validate.env';
import { HealthModule } from 'src/common/health/health.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { LoggingInterceptor } from 'src/common/logger/logging.interceptor';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { ApiUtilModule } from 'src/common/utils/api-util/api-util.module';
import { CacheUtilModule } from 'src/common/utils/cache-util/cache-util.module';
import { DateUtilModule } from 'src/common/utils/date-util/date-util.module';
import { ExcelUtilModule } from 'src/common/utils/excel-util/excel-util.module';
import { FileUtilModule } from 'src/common/utils/file-util/file-util.module';
import { PaginationUtilModule } from 'src/common/utils/pagination-util/pagination-util.module';
import { QueryUtilModule } from 'src/common/utils/query-util/query-util.module';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response/format-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate,
    }),
    LoggerModule,
    ApiUtilModule,
    PrismaModule,
    HealthModule,
    StringUtilModule,
    DateUtilModule,
    QueryUtilModule,
    CacheUtilModule,
    PaginationUtilModule,
    ExcelUtilModule,
    FileUtilModule,
    UsersModule,
  ],
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
    {
      provide: APP_INTERCEPTOR,
      useClass: FormatResponseInterceptor,
    },
  ],
})
export class AppModule {}
