import { PickType } from '@nestjs/mapped-types';
import { User } from '../../users/entities/user.entity';

// (PickType: copy field)
export class Auth extends PickType(User, ['email', 'phone', 'password']) {}
