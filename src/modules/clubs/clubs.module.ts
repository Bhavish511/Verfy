import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports:[HttpModule,AuthModule],
  controllers: [ClubsController],
  providers: [ClubsService],
})
export class ClubsModule {}
