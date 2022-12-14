import { MailService } from '../mail/mail.service';
import { CheckEmailDto } from '../users/dto/check-email.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RandomGenerator } from 'src/util/generator/create-random-password';
import { jwtConstants } from './constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.usersService.findOne(loginUserDto.email);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(loginUserDto.password, user.password);

    if (!isMatch) {
      return null;
    }

    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    };
    const me = await this.usersService.findOne(user.email);

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '24h',
    });

    await this.usersService.update(me.id, { refreshToken });

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
        expiresIn: '1h',
      }),
      refreshToken,
      isCoupleConnected: me.coupleId ? true : false,
    };
  }

  async validateEmail(checkEmailDto: CheckEmailDto) {
    const toCheckEmail = checkEmailDto.email;
    const isExistEmail: boolean = await this.usersService.isExistEmail(
      toCheckEmail,
    );

    if (isExistEmail) {
      throw new ConflictException('중복 이메일 입니다');
    }

    const newRandomCode: string = RandomGenerator.createRandomString(6);
    await this.mailService.sendCodeToNewUser(toCheckEmail, newRandomCode);

    return newRandomCode;
  }
}
