import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class AddCoupleInformationDto {
  @ApiProperty({ example: '2022-09-25' })
  @IsOptional()
  anniversary: string;

  @ApiProperty({ example: '짐승' })
  @IsOptional()
  nickname: string;

  @ApiProperty({ example: '아파트' })
  @IsOptional()
  specialPlace: string;

  @ApiProperty({ example: '오늘도 사랑해' })
  @IsOptional()
  todayComment: string;

  @ApiProperty({ example: '분홍색' })
  @IsOptional()
  backgroundColor: string;
}
