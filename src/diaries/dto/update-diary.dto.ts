import { ApiProperty } from '@nestjs/swagger';

export class UpdateDiaryDto {
  @ApiProperty({ description: '다이어리 제목', example: '다이어리 제목' })
  title: string;
  @ApiProperty({ description: '다이어리 내용', example: '다이어리 내용' })
  content: string;
  @ApiProperty({ description: '이미지 urls', example: [] })
  images: string[];
}
