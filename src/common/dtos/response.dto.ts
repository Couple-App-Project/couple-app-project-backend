import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '응답 데이터' })
  data: T;
}
