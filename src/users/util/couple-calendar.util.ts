import { Calendar, Couple, User } from '@prisma/client';
import { LocalDate } from 'js-joda';
import { DateTimeUtil } from 'src/util/datetime.util';

export class CoupleCalendarUtil {
  private couple: Couple & { users: User[] };
  private currentUser: User;
  private partner: User;
  private startDate: string;
  private endDate: string;

  constructor({
    currentUserId,
    couple,
    startDate,
    endDate,
  }: {
    currentUserId: number;
    couple: Couple & { users: User[] };
    startDate: string;
    endDate: string;
  }) {
    this.couple = couple;
    this.startDate = startDate;
    this.endDate = endDate;
    this.currentUser = couple.users.find(
      (user: User) => user.id === currentUserId,
    );
    this.partner = couple.users.find((user: User) => user.id !== currentUserId);
  }

  getBirthdayCalendar(): (Calendar & { user: User })[] {
    if (!this.couple) return [];

    const calendars: (Calendar & { user: User })[] = [];

    this.couple.users.map((user: User) => {
      if (this.isIncludeBirthDay(user)) {
        calendars.push(
          this.createCalendar(user, '생일', `${user.nickname}의 생일`),
        );
      }
    });

    return calendars;
  }

  getAnniversaryCalendars(): (Calendar & { user: User })[] {
    if (!this.couple) return [];

    const calendars: (Calendar & { user: User })[] = [];

    for (let nth = 1; nth <= 10; nth++) {
      const anniversaryDate = this.getAnniversaryDate(nth);

      if (this.isIncludeAnniversaryDate(anniversaryDate)) {
        calendars.push(
          this.createCalendar(
            this.currentUser,
            '기념일',
            `${this.partner.nickname}와(과) 함께한 ${100 * nth}일`,
          ),
        );
      }
    }

    return calendars;
  }

  private isIncludeBirthDay(user: User): boolean {
    const userBirthDay = DateTimeUtil.toLocalDate(user.birthDay);
    const startLocalDate = DateTimeUtil.toLocalDateBy(this.startDate);
    const endLocalDate = DateTimeUtil.toLocalDateBy(this.endDate);

    const startOfYear = LocalDate.of(startLocalDate.year(), 1, 1);
    const endOfYear = LocalDate.of(endLocalDate.year(), 12, 31);

    const userBirthdayThisYear = LocalDate.of(
      startLocalDate.year(),
      userBirthDay.monthValue(),
      userBirthDay.dayOfMonth(),
    );

    const userBirthdayIsInRange =
      userBirthdayThisYear.isAfter(startLocalDate) &&
      userBirthdayThisYear.isBefore(endLocalDate);

    const userBirthdayIsInNextRange =
      userBirthDay.isBefore(startOfYear) &&
      LocalDate.of(
        endLocalDate.year(),
        userBirthDay.monthValue(),
        userBirthDay.dayOfMonth(),
      ).isBefore(endOfYear);

    return userBirthdayIsInRange || userBirthdayIsInNextRange;
  }

  private isIncludeAnniversaryDate(anniversaryDate: string): boolean {
    const startLocalDate = DateTimeUtil.toLocalDateBy(this.startDate);
    const endLocalDate = DateTimeUtil.toLocalDateBy(this.endDate);

    const anniversaryLocalDate = DateTimeUtil.toLocalDateBy(anniversaryDate);

    return (
      anniversaryLocalDate.isAfter(startLocalDate) &&
      anniversaryLocalDate.isBefore(endLocalDate)
    );
  }

  private createCalendar(
    user: User,
    type: '생일' | '기념일',
    title: string,
  ): Calendar & { user: User } {
    const thisBirthDay = this.getThisBirthDay(user);
    return {
      id: 0,
      userId: user.id,
      type,
      title,
      startDate: thisBirthDay,
      endDate: thisBirthDay,
      startTime: null,
      endTime: null,
      content: null,
      location: null,
      createdAt: null,
      updatedAt: null,
      user,
    };
  }

  private getThisBirthDay(user: User): string {
    const userBirthDay = DateTimeUtil.toLocalDate(user.birthDay);
    const startLocalDate = DateTimeUtil.toLocalDateBy(this.startDate);
    const endLocalDate = DateTimeUtil.toLocalDateBy(this.endDate);

    const thisBirthDay =
      startLocalDate.monthValue() > endLocalDate.monthValue()
        ? LocalDate.of(
            endLocalDate.year(),
            userBirthDay.monthValue(),
            userBirthDay.dayOfMonth(),
          )
        : LocalDate.of(
            startLocalDate.year(),
            userBirthDay.monthValue(),
            userBirthDay.dayOfMonth(),
          );

    return thisBirthDay.toString();
  }

  private getAnniversaryDate(nth: number): string {
    const anniversary = DateTimeUtil.toLocalDateBy(this.couple.anniversary);
    return anniversary.plusDays(100 * nth).toString();
  }
}
