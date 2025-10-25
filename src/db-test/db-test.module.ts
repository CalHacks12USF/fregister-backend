import { Module } from '@nestjs/common';
import { DbTestService } from './db-test.service';
import { DbTestController } from './db-test.controller';

@Module({
  controllers: [DbTestController],
  providers: [DbTestService],
})
export class DbTestModule {}
