import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ApiUtilService } from '../common/utils/api-util/api-util.service';
import { ZodExceptionFilter } from './zod-exception/zod-exception.filter';

// bắt lại toàn bộ lỗi trong hệ thống, chuyển thành format chuẩn
@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly zodFilter: ZodExceptionFilter,
    private apiUtilService: ApiUtilService,
  ) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const exceptions = this.extractErrors(exception);

    const exceptionValue: {
      status: number;
      exceptions: any;
    } = {
      status: exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR,
      exceptions,
    };

    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodSerializationException
    ) {
      const zodErrors = this.zodFilter.catch(exception);
      if (zodErrors) {
        exceptionValue.exceptions = zodErrors;
        exceptionValue.status = HttpStatus.BAD_REQUEST;
      }
    }

    const responseBody = this.apiUtilService.formatResponse({
      errors: exceptionValue.exceptions,
    });

    httpAdapter.reply(ctx.getResponse(), responseBody, exceptionValue.status);
  }

  // Trích xuất lỗi từ exception, hỗ trợ nhiều format khác nhau
  private extractErrors(exception: any): any[] {
    // Trường hợp 1: exception.response.errors là array (khi throw BadRequestException([...errors]))
    if (Array.isArray(exception.response?.errors)) {
      return exception.response.errors.map((msg: string) => ({
        message: msg,
      }));
    }

    // Trường hợp 2: exception.response.message là string hoặc array (NestJS default)
    if (exception.response?.message) {
      const messages = Array.isArray(exception.response.message)
        ? exception.response.message
        : [exception.response.message];
      return messages.map((msg: string) => ({
        message: msg,
      }));
    }

    // Trường hợp 3: exception.message trực tiếp
    if (exception.message) {
      return [{ message: exception.message }];
    }

    // Trường hợp 4: exception.error?.message
    if (exception.error?.message) {
      return [{ message: exception.error.message }];
    }

    // Fallback - không có thông tin lỗi
    return [{ message: 'Unknown error' }];
  }
}
