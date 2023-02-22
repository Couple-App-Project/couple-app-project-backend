import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CouplesService } from '../couples/couples.service';
import { CurrentUserDto } from '../users/dto/current-user.dto';

@Injectable()
export class DiariesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly couplesService: CouplesService,
  ) {}

  async isOurDiary(user: CurrentUserDto, diaryId: number) {
    const [me, you] = await this.couplesService.findMeAndYou(user.userId);
    const diary = await this.prismaService.diary.findUnique({
      where: {
        id: diaryId,
      },
    });
    return [me.id, you.id].includes(diary.userId);
  }
}
