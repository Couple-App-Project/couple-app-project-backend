import { Transform } from 'class-transformer';

export interface CustomValidationOptions {
  each?: boolean;
}

const isNumeric = (value: string): boolean => {
  return (
    ['string', 'number'].includes(typeof value) &&
    /^-?\d+$/.test(value) &&
    isFinite(value as any)
  );
};

const transformNumeric = (value: string): number | string => {
  if (!isNumeric(value)) {
    return 'not a int string';
  } else {
    return parseInt(value, 10);
  }
};

export function ParseIntTransform(
  option?: CustomValidationOptions,
): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value) return null;
    if (option?.each && typeof value === 'object') {
      return value.map((v) => transformNumeric(v));
    } else if (!isNumeric(value)) {
      return 'not a int string';
    }
    return parseInt(value, 10);
  });
}
