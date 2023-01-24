import { CheckEmailDto } from './../users/dto/check-email.dto';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailService } from 'src/mail/mail.service';
import { RefreshAuthGuard } from './refresh-auth.guard';
import { jwtConstants } from './constants';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { currentUser } from '../decorators/user.decorator';
import { CurrentUserDto } from '../users/dto/current-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiTags('회원 인증')
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(
    @currentUser() user: CurrentUserDto,
    @Body() loginUserDto: LoginUserDto,
  ) {
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '토큰 테스트' })
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@currentUser() user: CurrentUserDto) {
    return `유효한 토큰! 로그인되어 있음. userId: ${user.userId}, userName: ${user.userName}`;
  }

  @Post('email')
  async validateEmail(@Body() checkEmailDto: CheckEmailDto) {
    return this.authService.validateEmail(checkEmailDto);
  }

  @UseGuards(RefreshAuthGuard)
  @ApiTags('회원 인증')
  @ApiOperation({ summary: 'Access token 재발급' })
  @Get('reissue')
  @ApiBearerAuth()
  reissueAccessToken(@currentUser() user: CurrentUserDto) {
    const payload = {
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });
    return { accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @ApiTags('회원 인증')
  @ApiOperation({ summary: '로그아웃' })
  @Get('logout')
  @ApiBearerAuth()
  async logout(@currentUser() user: CurrentUserDto) {
    await this.prismaService.user.update({
      where: { id: user.userId },
      data: { refreshToken: null },
    });
    return { message: '로그아웃 되었습니다.' };
  }
}
