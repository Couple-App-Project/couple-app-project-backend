import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RandomGenerator } from '../util/generator/create-random-password';

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
    try {
      await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          password: createUserDto.password,
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
