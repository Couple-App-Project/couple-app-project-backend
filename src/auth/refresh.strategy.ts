import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private prismaService: PrismaService) {
    super({
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies.refreshToken;
        }
        return token;
      },
      secretOrKey: jwtConstants.refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(@Req() req, payload: any) {
    const me = await this.prismaService.user.findUnique({
      where: { email: payload.userEmail },
    });

    const refreshToken = req.cookies.refreshToken;

    if (me.refreshToken !== refreshToken) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.userId,
      userName: payload.userName,
      userEmail: payload.email,
    };
  }
}
