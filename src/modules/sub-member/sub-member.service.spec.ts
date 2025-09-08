import { Test, TestingModule } from '@nestjs/testing';
import { SubMemberService } from './sub-member.service';

describe('SubMemberService', () => {
  let service: SubMemberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubMemberService],
    }).compile();

    service = module.get<SubMemberService>(SubMemberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
