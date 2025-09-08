import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EovController } from './eov.controller';
import { EovService } from './eov.service';
import { AuthModule } from '../auth/auth.module';
import { JsonServerModule } from '../json-server/json-server.module';

@Module({
  imports: [AuthModule,HttpModule,JsonServerModule],
  controllers: [EovController],
  providers: [EovService],
})
export class EovModule {}
