import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ZodPipe } from 'src/common/pipes/zod.pipe';
import { ParseParamsPaginationPipe } from '../../common/pipes/parse-params-pagination.pipe';
import type { GetOptionsParams } from '../../common/query/options.interface';
import { CreateUserSchema, type CreateUserDto } from './dto/create-user.dto';
import type { GetUsersPaginationDto } from './dto/get-user.dto';
import { UpdateUserSchema, type UpdateUserDto } from './dto/update-user.dto';
import type { User as UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body(new ZodPipe(CreateUserSchema)) createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getUsers(@Query() query: GetUsersPaginationDto) {
    return this.usersService.getUsers(query);
  }

  @Get('options')
  getUserOptions(@Query() query: GetOptionsParams<UserEntity>) {
    return this.usersService.getOptions(query);
  }

  @Get(':id')
  getUser(@Param('id') id: UserEntity['id']) {
    return this.usersService.getUser({ id });
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: UserEntity['id'],
    @Body(new ZodPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser({
      data: updateUserDto,
      where: { id },
    });
  }

  @Delete(':id')
  deleteUser(@Param('id') id: UserEntity['id']) {
    return this.usersService.deleteUser({ id });
  }
}
