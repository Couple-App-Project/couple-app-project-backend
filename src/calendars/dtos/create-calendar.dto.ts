import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateCalendarDto {
  @ApiProperty({ description: '제목', example: '영화 보러 가기' })
  @IsString()
  title: string;

  @ApiProperty({
    description: '타입',
    example: '데이트',
    enum: ['데이트', '기념일'],
  })
  @IsEnum(['데이트', '기념일'])
  type: string;

  @ApiProperty({ description: '시작 날짜', example: '2022-12-30' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: '끝나는 날짜', example: '2022-12-30' })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({ description: '시작 시간', example: '22:00' })
  @IsOptional()
  @IsString()
  startTime: string;

  @ApiPropertyOptional({ description: '종료 시간', example: '23:00' })
  @IsOptional()
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ description: '내용', example: '아바타' })
  @IsOptional()
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '지역', example: '지역?' })
  @IsOptional()
  @IsString()
  location: string;
}
