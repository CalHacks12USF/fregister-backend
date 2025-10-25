import { Test, TestingModule } from '@nestjs/testing';
import { MlConnectorController } from './ml-connector.controller';

describe('MlConnectorController', () => {
  let controller: MlConnectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MlConnectorController],
    }).compile();

    controller = module.get<MlConnectorController>(MlConnectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
