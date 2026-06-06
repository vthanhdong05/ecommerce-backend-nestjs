import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { CatchEverythingFilter } from 'src/catch-everything/catch-everything.filter';
import { ZodExceptionFilter } from 'src/catch-everything/zod-exception/zod-exception.filter';
import { validate } from 'src/common/envs/validate.env';
import { AccessControlGuard } from 'src/common/guards/access-control/access-control.guard';
import { HealthModule } from 'src/common/health/health.module';
import { FormatResponseInterceptor } from 'src/common/interceptors/format-response/format-response.interceptor';
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
import { EventsModule } from 'src/events/events.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { RolesModule } from './roles/roles.module';
import { UserSystemRolesModule } from './user-system-role/user-system-roles.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
    EventsModule,
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserSystemRolesModule,
    VendorsModule,
    ProductImagesModule,
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
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessControlGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
