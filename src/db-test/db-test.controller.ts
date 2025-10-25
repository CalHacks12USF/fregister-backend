import { Controller, Post } from '@nestjs/common';
import { DbTestService } from './db-test.service';

@Controller('db-test')
export class DbTestController {
  constructor(private readonly dbTestService: DbTestService) {}

  @Post('run')
  async testConnection(): Promise<unknown> {
    return await this.dbTestService.testConnection();
  }

  @Post('cleanup')
  async cleanupTestData(): Promise<unknown> {
    return await this.dbTestService.cleanupTestData();
  }
}
