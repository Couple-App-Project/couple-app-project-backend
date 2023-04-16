import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { CouplesService } from '../couples/couples.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, CouplesService],
  exports: [UsersService],
  imports: [PrismaModule, JwtModule.register({}), ScheduleModule.forRoot()],
})
export class UsersModule {}
