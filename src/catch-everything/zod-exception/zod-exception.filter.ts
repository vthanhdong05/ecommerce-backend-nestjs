import { Catch, ExceptionFilter } from '@nestjs/common';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

// bắt và xử lý các lỗi từ Zod khi validate/serialize dữ liệu
@Catch(ZodValidationException, ZodSerializationException)
export class ZodExceptionFilter implements ExceptionFilter {
  private convertZodExceptions(zodError: ZodError) {
    const messagesGrouped = Object.groupBy(zodError.issues, (item) => item.message);
    return Object.keys(messagesGrouped).map((message) => ({
      message,
      fields: messagesGrouped[message]?.map((item) => item.path[0]),
    }));
  }
  catch(exception: ZodValidationException | ZodSerializationException) {
    const zodError = exception.getZodError();
    if (zodError instanceof ZodError) {
      return this.convertZodExceptions(zodError);
    }
    return exception;
  }
}
