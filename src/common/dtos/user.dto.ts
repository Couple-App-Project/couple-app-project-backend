import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class UserDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  userNickname: string;

  constructor(user: User) {
    this.userId = user.id;
    this.userName = user.name;
    this.userNickname = user.nickname;
  }
}
