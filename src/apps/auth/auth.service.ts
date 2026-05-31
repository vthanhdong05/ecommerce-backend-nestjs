import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import { UsersService } from '../users/users.service';
import { JWTToken, TokenKeys } from './consts/jwt.const';
import { SignInDto, SignUpDto } from './dto/sign.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly stringUtilService: StringUtilService,
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
    const passwordHashed = await this.stringUtilService.hash(password);
    const userCreated = await this.userService.createUser({
      email,
      password: passwordHashed,
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
}
