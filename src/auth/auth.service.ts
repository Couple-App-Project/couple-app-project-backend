import { MailService } from '../mail/mail.service';
import { CheckEmailDto } from '../users/dto/check-email.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { RandomGenerator } from 'src/util/generator/create-random-password';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { jwtConstants } from './constants';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginUserDto.email },
    });

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

  async login(user: any, res) {
    const payload: IJwtPayload = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    };
    const me = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '24h',
    });

    await this.prismaService.user.update({
      where: { id: me.id },
      data: { refreshToken },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      path: '/auth/login',
      domain: 'https://couple-app-project-frontend.vercel.app',
      sameSite: 'Strict',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/auth/login',
      domain: 'https://couple-app-project-frontend.vercel.app',
      sameSite: 'Strict',
    });

    res.send({ isCoupleConnected: me.coupleId ? true : false });
  }

  async validateEmail(checkEmailDto: CheckEmailDto) {
    const toCheckEmail = checkEmailDto.email;
    const existEmail = await this.prismaService.user.findFirst({
      where: { email: toCheckEmail },
    });

    if (!!existEmail) {
      throw new ConflictException('중복 이메일 입니다');
    }

    const newRandomCode: string = RandomGenerator.createRandomString(6);
    await this.mailService.sendCodeToNewUser(toCheckEmail, newRandomCode);

    return newRandomCode;
  }
}
