import { Order } from '../../orders/entities/order.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';

export class ExportOrderPromotionsDto {
  orderIDs!: Order['id'][];
  promotionIDs!: Promotion['id'][];
}
