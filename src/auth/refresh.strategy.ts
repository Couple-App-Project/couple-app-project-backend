import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(@Req() req, payload: any) {
    const me = await this.prismaService.user.findUnique({
      where: { email: payload.userEmail },
    });

    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();

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
