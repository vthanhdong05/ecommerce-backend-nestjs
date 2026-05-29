import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
// (Nhận query từ request. Nếu có limit: chuyển từ string → number)
export class ParseParamsOptionPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (value.limit) {
      value.limit = parseInt(value.limit);
    }
    return value;
  }
}
