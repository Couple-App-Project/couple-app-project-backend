import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DateStringGenerator } from 'src/util/generator/create-date-string';

export class GetCalendarQueryDto {
  @ApiPropertyOptional({ description: '조회 월 YYMM (생략 시 전체)' })
  @IsOptional()
  month?: string;

  @ApiPropertyOptional({
    description: '조회할 타입',
    enum: ['데이트', '기념일'],
  })
  @IsOptional()
  @IsEnum(['데이트', '기념일'])
  type?: string;

  @ApiPropertyOptional({
    description: '검색 키워드',
    example: '코엑스',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  #firstDate: string;

  public hasMonth(): boolean {
    return this.month ? true : false;
  }

  public hasType(): boolean {
    return this.type ? true : false;
  }

  public hasKeyword(): boolean {
    return this.keyword ? true : false;
  }

  public getStartDate() {
    this.#firstDate = DateStringGenerator.getFirstDayByYYMM(this.month);
    return this.#firstDate;
  }

  public getEndDate() {
    return DateStringGenerator.plusMonth(this.#firstDate, 1);
  }
}
