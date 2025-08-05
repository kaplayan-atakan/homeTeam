import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { DeviceToken, DeviceTokenSchema } from './schemas/device-token.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { FirebaseService } from '../../config/firebase.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceToken.name, schema: DeviceTokenSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, FirebaseService],
  exports: [NotificationService, FirebaseService], // Diğer modüllerde kullanabilmek için
})
export class NotificationModule {}
