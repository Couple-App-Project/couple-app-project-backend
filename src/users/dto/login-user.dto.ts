import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'kjng5901@gmail.com' })
  email: string;

  @ApiProperty({ example: '5901' })
  password: string;
}
