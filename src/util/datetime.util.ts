import {
  convert,
  DateTimeFormatter,
  LocalDate,
  LocalDateTime,
  nativeJs,
} from 'js-joda';

export class DateTimeUtil {
  private static DATE_FORM = DateTimeFormatter.ofPattern('yyyy-MM-dd');
  private static DATETIME_FORM = DateTimeFormatter.ofPattern(
    'yyyy-MM-dd HH:mm:ss',
  );

  static toString(localDate: LocalDate | LocalDateTime): string {
    if (!localDate) {
      return '';
    }

    if (localDate instanceof LocalDate) {
      return localDate.format(DateTimeUtil.DATE_FORM);
    }
    return localDate.format(DateTimeUtil.DATETIME_FORM);
  }

  static toDate(localDate: LocalDate | LocalDateTime): Date {
    if (!localDate) {
      return null;
    }

    return convert(localDate).toDate();
  }

  static toLocalDate(date: Date): LocalDate {
    if (!date) {
      return null;
    }
    return LocalDate.from(nativeJs(date));
  }

  static toLocalDateTime(date: Date): LocalDateTime {
    if (!date) {
      return null;
    }
    return LocalDateTime.from(nativeJs(date));
  }

  static toLocalDateBy(strDate: string): LocalDate {
    if (!strDate) {
      return null;
    }

    return LocalDate.parse(strDate, DateTimeUtil.DATE_FORM);
  }

  static toLocalDateTimeBy(strDate: string): LocalDateTime {
    if (!strDate) {
      return null;
    }

    return LocalDateTime.parse(strDate, DateTimeUtil.DATETIME_FORM);
  }

  static getPeriodDays(startDate: string, endDate: string): number {
    if (!startDate || !endDate) {
      return 0;
    }

    const startDateLocalDate = DateTimeUtil.toLocalDateBy(startDate);
    const endDateLocalDate = DateTimeUtil.toLocalDateBy(endDate);

    return endDateLocalDate.toEpochDay() - startDateLocalDate.toEpochDay() + 1;
  }
}
