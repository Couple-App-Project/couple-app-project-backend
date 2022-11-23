import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  birthDay: Date;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  inviteCode: string;

  // @ApiProperty({ required: false, default: false })
  // published?: boolean = false;
}
