import { isYYMM } from '../validator/query-datestring.validation';

export class DateStringGenerator {
  static getFirstDayByYYMM(date: string): string {
    isYYMM(date);
    return '20' + date.slice(0, 2) + '-' + date.slice(2, 4) + '-01';
  }

  static getFirstDayByDate(date: Date): string {
    if (!date) {
      return null;
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    return year + '-' + month + '-01';
  }

  static plusMonth(datestring: string, amount: number): string {
    const splitedDate: string[] = datestring.split('-');
    if (splitedDate.length !== 3 || !datestring) {
      return null;
    }
    const year: number = +splitedDate[0];
    const month: number = +splitedDate[1];
    const day: string = splitedDate[2];

    return month === 12
      ? year + 1 + '-01-' + day
      : year + '-' + ('0' + (month + amount)).slice(-2) + '-' + day;
  }
}
