import { Test, TestingModule } from '@nestjs/testing';
import { SubMemberController } from './sub-member.controller';
import { SubMemberService } from './sub-member.service';

describe('SubMemberController', () => {
  let controller: SubMemberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubMemberController],
      providers: [SubMemberService],
    }).compile();

    controller = module.get<SubMemberController>(SubMemberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
