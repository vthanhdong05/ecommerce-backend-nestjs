import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from '../../apps/users/entities/user.entity';

export interface UserInfo {
  userID: UserEntity['id'];
  userEmail: UserEntity['email'];
}

// (Tạo decorator @User())
export const User = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.user as UserInfo;
});
