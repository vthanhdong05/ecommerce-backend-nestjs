import { Controller, Delete, Get } from '@nestjs/common';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { SkipPermission } from '../auth/auth.decorator';
import { CartsService } from './carts.service';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // (Lấy giỏ hàng hiện tại của user — tự động tạo mới nếu chưa có)
  @Get()
  @SkipPermission()
  getCart(@User() user: UserInfo) {
    return this.cartsService.getOrCreateCart(user.userID);
  }

  // (Xóa toàn bộ CartItem — dùng khi user muốn làm rỗng giỏ hàng thủ công)
  @Delete()
  @SkipPermission()
  clearCart(@User() user: UserInfo) {
    return this.cartsService.clearCart(user.userID);
  }
}
