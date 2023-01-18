import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DateStringGenerator } from 'src/util/generator/create-date-string';

export class GetCalendarQueryDto {
  @ApiPropertyOptional({ description: '조회 월 YYMM (생략 시 현재 월)' })
  @IsOptional()
  month?: string;

  @ApiPropertyOptional({
    description: '조회할 타입',
    enum: ['데이트', '기념일'],
  })
  @IsOptional()
  @IsEnum(['데이트', '기념일'])
  type?: string;

  #firstDate: string;

  public hasMonth(): boolean {
    return this.month ? true : false;
  }

  public hasType(): boolean {
    return this.type ? true : false;
  }

  public getStartDate() {
    this.#firstDate = this.month
      ? DateStringGenerator.getFirstDayByYYMM(this.month)
      : DateStringGenerator.getFirstDayByDate(new Date());

    return this.#firstDate;
  }

  public getEndDate() {
    return DateStringGenerator.plusMonth(this.#firstDate, 1);
  }
}
