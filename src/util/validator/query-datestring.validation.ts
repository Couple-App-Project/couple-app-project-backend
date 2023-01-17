import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
export function isYYMM(yymm: string): boolean {
  const mm = +yymm.slice(2, 4);
  if (mm < 0 || mm > 12 || yymm.length !== 4) {
    throw new BadRequestException('YYMM 형식이 아닙니다.');
  }

  return true;
}

export function IsYYMM(): PropertyDecorator {
  return Transform((v) => {
    isYYMM(v.value);
    return v.value;
  });
}
