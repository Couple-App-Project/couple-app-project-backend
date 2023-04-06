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
    if (couple) {
      this.currentUser = couple.users.find(
        (user: User) => user.id === currentUserId,
      );
      this.partner = couple.users.find(
        (user: User) => user.id !== currentUserId,
      );
    }
  }

  getBirthdayCalendar(): (Calendar & { user: User })[] {
    if (!this.couple) return [];

    const calendars: (Calendar & { user: User })[] = [];

    this.couple.users.map((user: User) => {
      if (this.isIncludeBirthDay(user)) {
        const userBirthDay = this.getThisBirthDay(user);
        calendars.push(
          this.createCalendar({
            user,
            type: '기념일',
            title: `${user.nickname || user.name}의 생일`,
            date: userBirthDay,
          }),
        );
      }
    });

    return calendars;
  }

  getAnniversaryCalendars(): (Calendar & { user: User })[] {
    if (!this.couple?.anniversary) return [];

    const calendars: (Calendar & { user: User })[] = [];
    const currentNth: number = Math.floor(
      DateTimeUtil.getPeriodDays(this.couple.anniversary, this.startDate) / 100,
    );
    if (currentNth < 0) return [];

    for (let nth = currentNth; nth <= currentNth + 5; nth++) {
      const anniversaryDate = this.getAnniversaryDate(nth);

      if (this.isIncludeAnniversaryDate(anniversaryDate)) {
        calendars.push(
          this.createCalendar({
            user: this.currentUser,
            type: '기념일',
            title: `${
              this.partner.nickname || this.partner.name
            }와(과) 함께한 ${100 * nth}일`,
            date: anniversaryDate,
          }),
        );
      }
    }

    return calendars;
  }

  private isIncludeBirthDay(user: User): boolean {
    const userBirthDay = DateTimeUtil.toLocalDate(user.birthDay);
    const startLocalDate = DateTimeUtil.toLocalDateBy(this.startDate);
    const endLocalDate = DateTimeUtil.toLocalDateBy(this.endDate);

    const userBirthdayThisYear =
      startLocalDate.year() < endLocalDate.year() &&
      userBirthDay.isAfter(startLocalDate)
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

    return (
      userBirthdayThisYear.isAfter(startLocalDate) &&
      userBirthdayThisYear.isBefore(endLocalDate)
    );
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

  private createCalendar({
    user,
    type,
    title,
    date,
  }: {
    user: User;
    type: '기념일';
    title: string;
    date: string;
  }): Calendar & { user: User } {
    return {
      id: 0,
      userId: user.id,
      type,
      title,
      startDate: date,
      endDate: date,
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
      startLocalDate.year() < endLocalDate.year() &&
      userBirthDay.isAfter(startLocalDate)
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
