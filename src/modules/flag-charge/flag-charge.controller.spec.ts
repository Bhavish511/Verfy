import { Test, TestingModule } from '@nestjs/testing';
import { FlagChargeController } from './flag-charge.controller';
import { FlagChargeService } from './flag-charge.service';

describe('FlagChargeController', () => {
  let controller: FlagChargeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlagChargeController],
      providers: [FlagChargeService],
    }).compile();

    controller = module.get<FlagChargeController>(FlagChargeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
