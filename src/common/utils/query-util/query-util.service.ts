import { Global, Injectable } from '@nestjs/common';

@Global()
@Injectable()
export class QueryUtilService {
  convertFieldsSelectOption(value: string) {
    return value?.split(',').reduce((acc, field) => ({ ...acc, [field]: true }), {});
  }
}
