import { UserInfo } from '../../decorators/user.decorator';
import { File } from './dto/excel-util.interface';

class ImportExcel {
  file!: File; // file upload từ client
  user!: UserInfo; // thông tin user đang thực hiện import
}

enum ColumnExport {
  REQUIRE_FIELDS = 'REQUIRE_FIELDS',
}

export { ImportExcel, ColumnExport };
