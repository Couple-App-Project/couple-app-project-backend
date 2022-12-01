import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async isExistEmail(email: string) {
    const existEmail = await this.prisma.user.findFirst({ where: { email } });
    return existEmail ? true : false;
  }

  create(createUserDto: CreateUserDto) {
    console.log(createUserDto.birthDay);
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password,
        birthDay: new Date(createUserDto.birthDay),
        gender: createUserDto.gender,
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
