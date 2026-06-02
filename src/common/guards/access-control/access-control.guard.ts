import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { Request } from 'express';
import { IS_SKIP_AUTH, IS_SKIP_PERMISSION } from 'src/apps/auth/auth.decorator';
import { UsersService } from 'src/apps/users/users.service';
import { Vendor } from 'src/apps/vendors/entities/vendor.entity';
import { EnvVars } from '../../envs/validate.env';
import { RequestMethod } from '../../utils/api-util/api-util.const';
import { Actions } from './access-control.const';

@Injectable()
// (phân quyền (authorization) - kiểm tra quyền của user)
export class AccessControlGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  // (Chuẩn hóa URL để tạo permission key)
  getCurrentRoute(req: Request) {
    const { path, params } = req;
    let basePath = path;
    const sortedParams = Object.entries(params).sort(
      ([, valueA], [, valueB]) => (valueB as string).length - (valueA as string).length,
    );
    for (const [key, value] of sortedParams) {
      basePath = basePath.replaceAll(value as string, `:${key}`);
    }
    return basePath.replace(this.configService.get(EnvVars.APP_PREFIX)!, '');
  }

  // (Kiểm tra user có quyền không)
  private async canAccessResources(
    userID: User['id'],
    permissionKey: string,
    vendorID?: Vendor['id'],
  ) {
    const isSupperAdmin = await this.usersService.isSuperAdmin(userID);
    if (isSupperAdmin) return true;

    const canAccess = await this.usersService.isExistPermissionKey({
      userID,
      permissionKey,
      vendorID,
    });
    return canAccess;
  }

  // (Convert HTTP method → action)
  getAction(httpMethod: RequestMethod) {
    const actionsConverter = {
      [RequestMethod.GET]: Actions.READ,
      [RequestMethod.POST]: Actions.CREATE,
      [RequestMethod.PUT]: Actions.UPDATE,
      [RequestMethod.PATCH]: Actions.UPDATE,
      [RequestMethod.DELETE]: Actions.DELETE,
    };
    const action = actionsConverter[httpMethod];
    if (!action) throw new BadRequestException('Action not define!');
    return action;
  }

  async canActivate(context: ExecutionContext) {
    // (Nếu API có decorator @SkipAuth() -> bỏ qua guard)
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipAuth) {
      return true;
    }
    // (Lấy thông tin user từ request)
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const user = req['user'];
    if (!user) return false; // (chặn luôn nếu chưa login)
    // (Nếu API có decorator @SkipPermission -> bỏ qua check permission)
    const isSkipPermission = this.reflector.getAllAndOverride<boolean>(IS_SKIP_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipPermission) {
      return true;
    }
    // return true;
    const route = this.getCurrentRoute(req);
    const action = this.getAction(req.method as unknown as RequestMethod);
    const vendor = Array.isArray(req.params['vendorId'])
      ? req.params['vendorId'][0]
      : req.params['vendorId'];
    const canAccess = await this.canAccessResources(
      user!.userID as string,
      `[${route}]_[${action}]`, // (Tạo permissionKey vd: [/users/:id]_[READ])
      vendor,
    );
    return canAccess;
  }
}
