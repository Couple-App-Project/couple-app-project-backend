import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.findOne(loginUserDto.email);

    // TODO: bcrypt 도입

    if (user && user.password === loginUserDto.password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      userId: user.userId,
      userName: user.userName,
      seq: user.seq,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
