import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCalendarDto {
  @ApiProperty({ description: '제목', example: '영화 보러 가기' })
  @IsString()
  title: string;

  @ApiProperty({ description: '타입', example: '데이트' })
  @IsString()
  type: string;

  @ApiProperty({ description: '날짜', example: '2022-12-30' })
  @IsString()
  date: string;

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

  @ApiPropertyOptional({
    description: '컬러 (내부 값 관리 어떻게 할지 논의 필요)',
    example: 'red',
  })
  @IsOptional()
  @IsString()
  color: string;

  @ApiPropertyOptional({
    description: '무드 (내부 값 관리 어떻게 할지 논의 필요)',
    example: 'gloomy',
  })
  @IsOptional()
  @IsString()
  mood: string;
}
