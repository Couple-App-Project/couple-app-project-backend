import { ApiProperty } from '@nestjs/swagger';

export class ConnectCoupleDto {
  @ApiProperty({ example: 'vbbzj9' })
  inviteCode: string;
}
