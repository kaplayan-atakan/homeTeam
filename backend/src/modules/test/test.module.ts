import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [TestController],
})
export class TestModule {}
