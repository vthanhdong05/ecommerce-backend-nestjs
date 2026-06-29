import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard } from '@nestjs/throttler';
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
import { RateLimitModule } from 'src/common/security/rate-limit/rate-limit.module';
import { ApiUtilModule } from 'src/common/utils/api-util/api-util.module';
import { CacheUtilModule } from 'src/common/utils/cache-util/cache-util.module';
import { DateUtilModule } from 'src/common/utils/date-util/date-util.module';
import { ExcelUtilModule } from 'src/common/utils/excel-util/excel-util.module';
import { FileUtilModule } from 'src/common/utils/file-util/file-util.module';
import { MailUtilModule } from 'src/common/utils/mail-util/mail-util.module';
import { PaginationUtilModule } from 'src/common/utils/pagination-util/pagination-util.module';
import { QueryUtilModule } from 'src/common/utils/query-util/query-util.module';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { EventsModule } from 'src/events/events.module';
import { AutoMockingModule } from 'src/testing/auto-mocking/auto-mocking.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { CartsModule } from './carts/carts.module';
import { CategoriesModule } from './categories/categories.module';
import { OrderAddressesModule } from './order-addresses/order-addresses.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrderPromotionsModule } from './order-promotions/order-promotions.module';
import { OrdersModule } from './orders/orders.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { ProductVariantsModule } from './product-variants/product-variants.module';
import { ProductsModule } from './products/products.module';
import { PromotionsModule } from './promotions/promotions.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { RolesModule } from './roles/roles.module';
import { UserSystemRolesModule } from './user-system-role/user-system-roles.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { UserVendorRolesModule } from './user-vendor-roles/user-vendor-roles.module';

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
    AutoMockingModule,
    MailUtilModule,
    RateLimitModule,
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserSystemRolesModule,
    UserVendorRolesModule,
    VendorsModule,
    ProductImagesModule,
    CategoriesModule,
    ProductsModule,
    ProductVariantsModule,
    ProductCategoriesModule,
    OrderAddressesModule,
    OrderItemsModule,
    OrdersModule,
    PromotionsModule,
    OrderPromotionsModule,
    CartsModule,
    CartItemsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ZodExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
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
