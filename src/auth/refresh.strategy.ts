import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { UsersService } from '../users/users.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.refreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(@Req() req, payload: any) {
    const me = await this.usersService.findOne(payload.userEmail);

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
