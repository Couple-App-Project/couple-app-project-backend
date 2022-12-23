import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RandomGenerator } from '../util/create-random-password';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async isExistEmail(email: string) {
    const existEmail = await this.prisma.user.findFirst({ where: { email } });
    return existEmail ? true : false;
  }

  async create(createUserDto: CreateUserDto) {
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

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
        birthDay: new Date(createUserDto.birthDay),
        gender: createUserDto.gender,
        inviteCode: inviteCode,
      },
    });
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
