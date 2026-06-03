import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { User } from '../../common/decorators/user.decorator';
import { SkipPermission } from '../auth/auth.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('profile')
export class UserProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @SkipPermission()
  getUserProfile(@User() user: UserInfo) {
    return this.usersService.getUserProfile(user.userID);
  }

  @Patch()
  @SkipPermission()
  updateUserProfile(@User() user: UserInfo, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUserProfile({
      userID: user.userID,
      data: updateUserDto,
    });
  }
}
