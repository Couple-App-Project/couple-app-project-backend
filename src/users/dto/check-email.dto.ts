import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckEmailDto {
  @ApiProperty({ description: '이메일', example: '1111@gamil.com' })
  @IsEmail()
  email: string;
}
