import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
// (Xử lý query phân trang trước khi vào logic chính)
@Injectable()
export class ParseParamsPaginationPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (value.itemPerPage) value.itemPerPage = parseInt(value.itemPerPage);
    if (value.page) {
      const page = parseInt(value.page);
      value.page = isNaN(page) || page === 0 ? 1 : page;
    }
    return value;
  }
}
