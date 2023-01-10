import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RandomGenerator } from '../util/generator/create-random-password';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async isExistEmail(email: string) {
    const existEmail = await this.prisma.user.findFirst({ where: { email } });
    return existEmail ? true : false;
  }

  async create(createUserDto: CreateUserDto) {
    if (await this.isExistEmail(createUserDto.email)) {
      return { message: '이미 가입된 email 입니다.' };
    }

    let inviteCode;

    // 중복되는 코드가 있을 경우를 방지
    while (true) {
      inviteCode = RandomGenerator.createRandomString(6);
      const duplicatedCode = await this.prisma.user.findFirst({
        where: { inviteCode },
      });
      if (!duplicatedCode) {
        break;
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    try {
      await this.prisma.user.create({
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
      return { message: '데이터 형식을 다시 확인해주세요.' };
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(email: string) {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
