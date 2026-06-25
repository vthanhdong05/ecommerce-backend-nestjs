import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CartItem } from '@prisma/client';
import { User, type UserInfo } from 'src/common/decorators/user.decorator';
import { SkipPermission } from '../auth/auth.decorator';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cartItems')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  @SkipPermission()
  addCartItem(@Body() dto: CreateCartItemDto, @User() user: UserInfo) {
    return this.cartItemsService.createCartItem({
      userID: user.userID,
      productVariantID: dto.productVariantID,
      quantity: dto.quantity,
    });
  }

  @Patch(':id')
  @SkipPermission()
  updateCartItem(
    @Param('id') id: CartItem['id'],
    @Body() updateCartItemDto: UpdateCartItemDto,
    @User() user: UserInfo,
  ) {
    return this.cartItemsService.updateCartItem({
      data: updateCartItemDto,
      where: { id },
      userID: user.userID,
    });
  }

  @Delete(':id')
  @SkipPermission()
  deleteCartItem(@Param('id') id: CartItem['id'], @User() user: UserInfo) {
    return this.cartItemsService.deleteCartItem({ id }, user.userID);
  }
}
