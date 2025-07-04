import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MusicService } from './music.service';
import { MusicController } from './music.controller';
import { MusicIntegration, MusicIntegrationSchema } from './music-integration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MusicIntegration.name, schema: MusicIntegrationSchema }]),
    // HttpModule, // HTTP istekleri için (gerekli paket kurulu olmadığında)
    ConfigModule, // Konfigürasyon için
  ],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService], // Diğer modüller tarafından kullanılabilmesi için
})
export class MusicModule {}
