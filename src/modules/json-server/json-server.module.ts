import { Module } from '@nestjs/common';
import { JsonServerService } from '../../services/json-server.service';
import { JsonServerController } from '../../controllers/json-server.controller';

@Module({
  controllers: [JsonServerController],
  providers: [JsonServerService],
  exports: [JsonServerService],
})
export class JsonServerModule {}
