import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post()
  @ApiTags('회원 관리')
  @ApiOperation({ summary: '회원 가입' })
  async create(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
    const newUser = await this.usersService.findOne(createUserDto.email);
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

    await this.usersService.update(newUser.id, { refreshToken });

    return {
      message: '회원 가입 완료!',
      accessToken,
      refreshToken,
    };
  }

  @Cron('0 0 0 * * *')
  @Patch('todaycomment')
  @ApiOperation({ summary: '오늘의 한마디 초기화(0시마다 실행)' })
  async resetTodayComments() {
    await this.prismaService.user.updateMany({
      data: { todayComment: '' },
    });
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
