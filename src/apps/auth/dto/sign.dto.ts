import { createZodDto } from 'nestjs-zod';
import { withResponse } from 'src/common/interceptors/format-response/format-response.util';
import { UserSchema } from 'src/generated/zod';
import { z } from 'zod';
import { TokenKeys } from '../consts/jwt.const';

const SignInSchema = UserSchema.pick({
  email: true,
  password: true,
}).extend({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const SignUpSchema = SignInSchema.merge(
  UserSchema.pick({
    firstName: true,
    fullAddress: true,
  }),
).extend({
  firstName: z.string().min(1, 'First name is required'),
  fullAddress: z.string().min(5, 'Address is too short'),
});

const SignInResponseSchema = withResponse(
  z.object({
    [TokenKeys.ACCESS_TOKEN_KEY]: z.string(),
    [TokenKeys.REFRESH_TOKEN_KEY]: z.string(),
  }),
);

class SignInDto extends createZodDto(SignInSchema) {}
class SignUpDto extends createZodDto(SignUpSchema) {}
class SignInResponseDto extends createZodDto(SignInResponseSchema) {}

export { SignInDto, SignInResponseDto, SignUpDto };
