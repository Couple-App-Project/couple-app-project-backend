import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RandomGenerator } from '../util/generator/create-random-password';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async isExistEmail(email: string) {
    const existEmail = await this.prismaService.user.findFirst({
      where: { email },
    });
    return existEmail ? true : false;
  }

  async create(createUserDto: CreateUserDto) {
    if (await this.isExistEmail(createUserDto.email)) {
      throw new BadRequestException('이미 가입된 email 입니다.');
    }

    let inviteCode;

    // 중복되는 코드가 있을 경우를 방지
    while (true) {
      inviteCode = RandomGenerator.createRandomString(6);
      const duplicatedCode = await this.prismaService.user.findFirst({
        where: { inviteCode },
      });
      if (!duplicatedCode) {
        break;
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      await this.prismaService.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          password: hashedPassword,
          birthDay: new Date(createUserDto.birthDay),
          gender: createUserDto.gender,
          inviteCode: inviteCode,
        },
      });
      return { message: '회원가입 완료.' };
    } catch (e) {
      console.error(e);
      throw new BadRequestException('데이터 형식을 다시 확인해주세요.');
    }
  }
}
