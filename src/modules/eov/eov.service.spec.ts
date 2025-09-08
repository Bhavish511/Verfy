import { Test, TestingModule } from '@nestjs/testing';
import { EovService } from './eov.service';

describe('EovService', () => {
  let service: EovService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EovService],
    }).compile();

    service = module.get<EovService>(EovService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
