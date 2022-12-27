import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCalendarDto {
  @ApiProperty({ description: '제목', example: '영화 보러 가기' })
  @IsString()
  title: string;

  @ApiProperty({ description: '내용', example: '아바타' })
  @IsString()
  content: string;

  @ApiProperty({ description: '컬러 (내부 값 관리 어떻게 할지 논의 필요)' })
  @IsString()
  color: string;

  @ApiProperty({ description: '무드 (내부 값 관리 어떻게 할지 논의 필요)' })
  @IsString()
  mood: string;
}
