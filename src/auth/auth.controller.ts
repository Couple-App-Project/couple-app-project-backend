import { CheckEmailDto } from './../users/dto/check-email.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginUserDto } from '../users/dto/login-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailService } from 'src/mail/mail.service';
import { RefreshAuthGuard } from './refresh-auth.guard';
import { jwtConstants } from './constants';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { currentUser } from '../decorators/user.decorator';
import { CurrentUserDto } from '../users/dto/current-user.dto';

@ApiTags('회원 인증')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(
    @currentUser() user: CurrentUserDto,
    @Body() loginUserDto: LoginUserDto,
    @Response() res,
  ) {
    return this.authService.login(user, res);
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
  @ApiOperation({ summary: 'Access token 재발급' })
  @Get('reissue')
  @ApiBearerAuth()
  reissueAccessToken(@currentUser() user: CurrentUserDto, @Response() res) {
    const payload = {
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });

    res.cookie('accessToken', accessToken, { httpOnly: true });

    res.send({ message: 'access token 재발급 완료.' });
  }

  @UseGuards(JwtAuthGuard)
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

  @ApiOperation({ summary: '이메일 중복 확인' })
  @Get('exist/:email')
  async isExistEmail(@Param('email') email: string) {
    const existUser = await this.prismaService.user.findFirst({
      where: { email: email },
    });
    const isExist = !!existUser;

    if (isExist) {
      throw new BadRequestException('이미 가입된 email 입니다.');
    }

    return { message: '가입 가능한 email 입니다.' };
  }
}
