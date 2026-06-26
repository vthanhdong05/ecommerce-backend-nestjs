import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { MailTemplate } from 'src/common/utils/mail-util/mail-util.const';
import { MailUtilService } from 'src/common/utils/mail-util/mail-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { UsersService } from '../users/users.service';
import { JWTToken, TokenKeys } from './consts/jwt.const';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password.dto';
import { SignInDto, SignUpDto } from './dto/sign.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly stringUtilService: StringUtilService,
    private mailUtilService: MailUtilService,
  ) {}

  async createToken<T extends Record<string, any>>(payload: T) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: JWTToken.ACCESS_TOKEN_EXPIRE_IN,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: JWTToken.REFRESH_TOKEN_EXPIRE_IN,
    });

    return {
      [TokenKeys.ACCESS_TOKEN_KEY]: accessToken,
      [TokenKeys.REFRESH_TOKEN_KEY]: refreshToken,
    };
  }

  async verifyToken(token: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      return decoded;
    } catch (error) {
      if (error instanceof TokenExpiredError) throw new UnauthorizedException(error);
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, password, ...otherInfo } = signUpDto;
    const user = await this.userService.getUser({ email });
    if (user) throw new BadRequestException('User already exist!');
    const userCreated = await this.userService.createUser({
      email,
      password,
      ...otherInfo,
    });
    const { password: _password, ...userResponse } = userCreated;
    return userResponse;
  }

  // Authentication
  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.userService.getUser({ email });
    const passwordHashed = user?.password;
    if (!passwordHashed || user?.deletedAt) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await this.stringUtilService.compare(password, passwordHashed);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    // Tạo JWT token
    const { id: userID, email: userEmail } = user;
    return await this.createToken({ userID, userEmail });
  }

  async refreshToken(refreshToken: string) {
    const decoded = await this.verifyToken(refreshToken);
    const { iat: _iat, exp: _exp, ...user } = decoded;
    return this.createToken(user as UserInfo);
  }

  sendSMS() {
    return {};
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email, phone, redirectTo } = forgotPasswordDto;
    const user = await this.userService.extended.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (!user) return { message: 'If this account exists, a reset email has been sent.' };
    const resetToken = await this.jwtService.signAsync(
      { userId: user.id },
      { expiresIn: JWTToken.RESET_TOKEN_EXPIRE_IN },
    );
    await this.userService.extended.update({
      where: { id: user.id },
      data: { resetToken },
    });
    const resetLink = `${redirectTo}?token=${resetToken}`;
    if (user.email) {
      // Bắt lỗi gửi mail, không throw 500
      try {
        await this.mailUtilService.sendMail({
          to: user.email,
          subject: 'Reset password',
          template: MailTemplate.RESET_PASSWORD,
          context: {
            redirectTo: resetLink,
            username: user.firstName,
            sentAt: new Date().toLocaleString(),
          },
        });
      } catch {
        throw new InternalServerErrorException('Failed to send reset password email');
      }
    } else {
      this.sendSMS();
    }
    return { message: 'If this account exists, a reset email has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, password } = resetPasswordDto;
    const decoded = await this.verifyToken(token);
    if (!decoded) throw new UnauthorizedException('Invalid token');
    // Kiểm tra token khớp trong DB (one-time use)
    const user = await this.userService.extended.findFirst({
      where: { resetToken: token },
    });
    if (!user) throw new UnauthorizedException('Token is invalid or already used');
    const hashedPassword = await this.stringUtilService.hash(password);
    // Đổi pass + xóa token
    await this.userService.extended.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
      },
    });

    return { message: 'Password reset successfully.' };
  }
}
