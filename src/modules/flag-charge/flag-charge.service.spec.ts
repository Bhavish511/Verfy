import { Test, TestingModule } from '@nestjs/testing';
import { FlagChargeService } from './flag-charge.service';

describe('FlagChargeService', () => {
  let service: FlagChargeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlagChargeService],
    }).compile();

    service = module.get<FlagChargeService>(FlagChargeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
