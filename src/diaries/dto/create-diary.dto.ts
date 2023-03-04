import { ApiProperty } from '@nestjs/swagger';
import { Multer } from 'multer';
import { Optional } from '@nestjs/common';

export class CreateDiaryDto {
  @ApiProperty({ description: 'Calendar id', example: 1 })
  calendarId: number;
  @ApiProperty({ description: '다이어리 제목', example: '다이어리 제목' })
  title: string;
  @ApiProperty({ description: '다이어리 내용', example: '다이어리 내용' })
  content: string;
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @Optional()
  files: Multer.File[];
}
