import { Test, TestingModule } from '@nestjs/testing';
import { EovController } from './eov.controller';
import { EovService } from './eov.service';

describe('EovController', () => {
  let controller: EovController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EovController],
      providers: [EovService],
    }).compile();

    controller = module.get<EovController>(EovController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
