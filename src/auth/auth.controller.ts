import { CheckEmailDto } from './../users/dto/check-email.dto';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MailService } from 'src/mail/mail.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
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
  getProfile() {
    return '유효한 토큰! 로그인되어 있음.';
  }

  @Post('email')
  async validateEmail(@Body() checkEmailDto: CheckEmailDto) {
    return this.authService.validateEmail(checkEmailDto);
  }
}
