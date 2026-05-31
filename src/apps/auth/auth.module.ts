import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { StringUtilModule } from 'src/common/utils/string-util/string-util.module';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTEnvs } from './consts/jwt.const';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>(JWTEnvs.JWT_SECRET),
      }),
    }),
    UsersModule,
    StringUtilModule,
  ],
  providers: [AuthService, StringUtilService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
