import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ example: 'kjng5901@gmail.com' })
  email: string;

  @ApiProperty({ example: '김정호' })
  name: string;

  @ApiProperty({ example: '5901' })
  password: string;

  @IsDate()
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
