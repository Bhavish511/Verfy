import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { AuthModule } from '../auth/auth.module';
import { JsonServerService } from 'src/services/json-server.service';


@Module({
  imports:[AuthModule],
  controllers: [ClubsController],
  providers: [ClubsService,JsonServerService],
})
export class ClubsModule {}
