import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RoleType } from '@prisma/client';
import { UserInfo } from '../../common/decorators/user.decorator';
import { IS_SKIP_AUTH, ROLES_KEY } from './auth.decorator';
import { AuthService } from './auth.service';
import { TokenKeys } from './consts/jwt.const';
// xác thực (Authentication) - kiểm tra login, token hợp lệ
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipAuth) {
      return true; // API có @SkipAuth() → bỏ qua kiểm tra token
    }

    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(req); // Lấy token
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.authService.verifyToken(token);
      const { iat: _iat, exp: _exp, ...user } = payload;
      req['user'] = user as UserInfo;
    } catch (err: unknown) {
      throw new UnauthorizedException((err as Error).message);
    }

    // Kiểm tra role nếu có yêu cầu
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles?.length) {
      const user = req['user'] as UserInfo;
      const hasRole = requiredRoles.some((role) => user.roleType === role);
      if (!hasRole) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }
    }

    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    const [type, bearerToken] = req.headers.authorization?.split(' ') ?? []; // Lấy token từ: Header: Authorization: Bearer <token>
    if (type === 'Bearer') return bearerToken;
    const cookieToken = req.cookies[TokenKeys.ACCESS_TOKEN_KEY]; // Lấy token từ: cookie: access_token
    return cookieToken ? cookieToken : undefined;
  }
}
