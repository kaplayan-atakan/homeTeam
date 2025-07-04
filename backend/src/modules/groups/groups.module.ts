import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from './group.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    UsersModule, // Users service'i kullanmak için
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService], // Diğer modüller tarafından kullanılabilmesi için
})
export class GroupsModule {}
