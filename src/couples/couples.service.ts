import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class CouplesService {
  constructor(private prismaService: PrismaService) {}
  async connectNewCouple(me: User, you: User) {
    const newCouple = await this.prismaService.couple.create({ data: {} });
    await this.prismaService.user.update({
      where: {
        id: me.id,
      },
      data: {
        coupleId: newCouple.id,
      },
    });
    await this.prismaService.user.update({
      where: {
        id: you.id,
      },
      data: {
        coupleId: newCouple.id,
      },
    });
  }

  async findMeAndYou(id: number) {
    const me = await this.prismaService.user.findUnique({
      where: { id },
    });

    const meAndYou = await this.prismaService.user.findMany({
      where: { coupleId: me.coupleId },
    });

    const you = meAndYou.filter((value) => value.id !== id)[0];

    return [me, you];
  }
}
