import {
  Body,
  Controller,
  Delete,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { currentUser } from '../decorators/user.decorator';
import { CurrentUserDto } from './dto/current-user.dto';
import { CouplesService } from '../couples/couples.service';

@ApiTags('회원 관리')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly couplesService: CouplesService,
  ) {}

  @Post()
  @ApiOperation({ summary: '회원 가입' })
  async create(@Body() createUserDto: CreateUserDto, @Response() res) {
    await this.usersService.create(createUserDto);
    const newUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    const payload = {
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: '24h',
    });

    await this.prismaService.user.update({
      where: { id: newUser.id },
      data: { refreshToken },
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'Strict',
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
    });

    res.send({ message: '회원 가입 완료!' });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete()
  @ApiOperation({ summary: '회원 탈퇴' })
  async delete(@currentUser() user: CurrentUserDto) {
    await this.couplesService.disconnectCouple(user);

    await this.prismaService.user.delete({
      where: {
        id: user.userId,
      },
    });
    return { message: '회원 탈퇴 완료.' };
  }

  @Cron('0 0 0 * * *')
  async resetTodayComments() {
    await this.prismaService.user.updateMany({
      data: { todayComment: '' },
    });
  }
}
