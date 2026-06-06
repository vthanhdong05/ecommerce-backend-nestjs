import type { UserInfo } from 'src/common/decorators/user.decorator';

export interface UploadProductImagePayload {
  file: Express.Multer.File;
  user: UserInfo;
  productID?: string;
  productVariantID?: string;
}
