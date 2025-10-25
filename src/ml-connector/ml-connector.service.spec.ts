import { Test, TestingModule } from '@nestjs/testing';
import { MlConnectorService } from './ml-connector.service';

describe('MlConnectorService', () => {
  let service: MlConnectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MlConnectorService],
    }).compile();

    service = module.get<MlConnectorService>(MlConnectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
