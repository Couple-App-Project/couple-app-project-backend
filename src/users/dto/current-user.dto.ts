export class CurrentUserDto {
  userId: number;
  userName: string;
  userEmail: string;

  constructor(userId: number, userName: string, userEmail: string) {
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
  }
}
