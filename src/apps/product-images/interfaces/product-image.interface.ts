import { ProductVariant } from 'src/apps/product-variants/entities/product-variant.entity';
import { Product } from 'src/apps/products/entities/product.entity';
import { Vendor } from 'src/apps/vendors/entities/vendor.entity';
import type { UserInfo } from 'src/common/decorators/user.decorator';

export interface UploadProductImagePayload {
  file: Express.Multer.File;
  user: UserInfo;
  productID?: Product['id'];
  productVariantID?: ProductVariant['id'];
  vendorID?: Vendor['id'];
}
