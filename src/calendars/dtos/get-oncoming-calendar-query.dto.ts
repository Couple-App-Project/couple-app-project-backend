import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { ParseIntTransform } from 'src/decorators/int-transform.decorator';

export class GetOncomingCalendarQueryDto {
  @ApiProperty()
  @IsOptional()
  @ParseIntTransform()
  @IsInt()
  limit: number;

  getLimit(): number {
    if (this.limit < 1 || !this.limit || isNaN(this.limit)) {
      this.limit = 5;
    }
    return this.limit;
  }
}
