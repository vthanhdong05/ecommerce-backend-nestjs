import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiUtilService } from '../../utils/api-util/api-util.service';
@Injectable()
// (tự động chuẩn hóa dữ liệu trả về từ tất cả các API trong NestJS)
export class FormatResponseInterceptor implements NestInterceptor {
  constructor(private apiUtilService: ApiUtilService) {}
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) =>
        this.apiUtilService.formatResponse({
          data,
        }),
      ),
    );
  }
}
