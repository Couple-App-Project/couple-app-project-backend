import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'kjng5901@gmail.com' })
  email: string;

  @ApiProperty({ example: '김정호' })
  name: string;

  @ApiProperty({ example: '5901' })
  password: string;

  // TODO: 올바른 형식의 날짜만 들어올 수 있도록
  @ApiProperty({ example: '1991-03-15' })
  birthDay: string;

  @ApiProperty({ enum: ['M', 'F', 'O'] })
  gender: Gender;
}

export enum Gender {
  Male = 'M',
  Female = 'F',
  Other = 'O',
}
