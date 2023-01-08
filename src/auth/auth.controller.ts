import { CheckEmailDto } from './../users/dto/check-email.dto';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MailService } from 'src/mail/mail.service';
import { RefreshAuthGuard } from './refresh-auth.guard';
import { jwtConstants } from './constants';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(@Req() req, @Body() loginUserDto: LoginUserDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '토큰 테스트' })
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req) {
    return `유효한 토큰! 로그인되어 있음. userId: ${req.user.userId}, userName: ${req.user.userName}`;
  }

  @Post('email')
  async validateEmail(@Body() checkEmailDto: CheckEmailDto) {
    return this.authService.validateEmail(checkEmailDto);
  }

  @UseGuards(RefreshAuthGuard)
  @ApiOperation({ summary: 'Access token 재발급' })
  @Get('reissue')
  @ApiBearerAuth()
  reissueAccessToken(@Req() req) {
    const payload = {
      userId: req.user.userId,
      userName: req.user.userName,
      userEmail: req.user.email,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });
    return { accessToken };
  }
}
