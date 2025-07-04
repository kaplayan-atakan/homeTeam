import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsNumber,
  IsArray,
  IsUrl,
  IsMongoId,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MusicProvider, PlaylistType } from '../music-integration.schema';

// SOLID: Single Responsibility Principle - Her DTO tek bir işlem için

export class ConnectMusicProviderDto {
  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;

  @IsString({ message: 'Authorization code gereklidir' })
  authCode: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;
}

export class RefreshTokenDto {
  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;
}

export class CreatePlaylistDto {
  @IsString({ message: 'Playlist adı gereklidir' })
  @MinLength(3, { message: 'Playlist adı en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Playlist adı en fazla 100 karakter olabilir' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Açıklama en fazla 500 karakter olabilir' })
  description?: string;

  @IsEnum(PlaylistType, { message: 'Geçerli bir playlist türü seçiniz' })
  type: PlaylistType;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trackIds?: string[]; // Provider'daki track ID'leri
}

export class AddTrackToPlaylistDto {
  @IsString({ message: 'Playlist ID gereklidir' })
  playlistId: string;

  @IsString({ message: 'Track ID gereklidir' })
  trackId: string;

  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;
}

export class RemoveTrackFromPlaylistDto {
  @IsString({ message: 'Playlist ID gereklidir' })
  playlistId: string;

  @IsString({ message: 'Track ID gereklidir' })
  trackId: string;
}

export class UpdateMusicPreferencesDto {
  @IsOptional()
  @IsBoolean()
  autoPlay?: boolean;

  @IsOptional()
  @IsString()
  defaultPlaylist?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Ses seviyesi 0-100 arasında olmalıdır' })
  @Max(100, { message: 'Ses seviyesi 0-100 arasında olmalıdır' })
  volume?: number;

  @IsOptional()
  @IsBoolean()
  shuffle?: boolean;

  @IsOptional()
  @IsBoolean()
  repeat?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Crossfade 0-12 saniye arasında olmalıdır' })
  @Max(12, { message: 'Crossfade 0-12 saniye arasında olmalıdır' })
  crossfade?: number;
}

export class PlayMusicDto {
  @IsOptional()
  @IsString()
  playlistId?: string;

  @IsOptional()
  @IsString()
  trackId?: string;

  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;

  @IsOptional()
  @IsBoolean()
  shuffle?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  volume?: number;
}

export class SearchMusicDto {
  @IsString({ message: 'Arama terimi gereklidir' })
  @MinLength(2, { message: 'Arama terimi en az 2 karakter olmalıdır' })
  query: string;

  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;

  @IsOptional()
  @IsString()
  type?: 'track' | 'album' | 'artist' | 'playlist';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class ImportPlaylistDto {
  @IsUrl({}, { message: 'Geçerli bir URL giriniz' })
  url: string;

  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;

  @IsOptional()
  @IsEnum(PlaylistType, { message: 'Geçerli bir playlist türü seçiniz' })
  type?: PlaylistType = PlaylistType.CUSTOM;
}

export class RecommendationDto {
  @IsEnum(PlaylistType, { message: 'Geçerli bir playlist türü seçiniz' })
  type: PlaylistType;

  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seedTracks?: string[]; // Öneri için baz alınacak şarkılar

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seedArtists?: string[]; // Öneri için baz alınacak sanatçılar

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seedGenres?: string[]; // Öneri için baz alınacak türler

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class MusicStatsDto {
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsEnum(MusicProvider)
  provider?: MusicProvider;

  @IsOptional()
  @IsEnum(PlaylistType)
  playlistType?: PlaylistType;
}

export class SyncPlaylistDto {
  @IsString({ message: 'Playlist ID gereklidir' })
  playlistId: string;

  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;
}

export class SharePlaylistDto {
  @IsString({ message: 'Playlist ID gereklidir' })
  playlistId: string;

  @IsArray({ message: 'Kullanıcı ID listesi bir dizi olmalıdır' })
  @IsMongoId({ message: 'Geçerli kullanıcı ID\'leri giriniz', each: true })
  userIds: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Mesaj en fazla 200 karakter olabilir' })
  message?: string;
}

export class TaskMusicMappingDto {
  @IsMongoId({ message: 'Geçerli bir görev ID giriniz' })
  taskId: string;

  @IsString({ message: 'Playlist ID gereklidir' })
  playlistId: string;

  @IsEnum(MusicProvider, { message: 'Geçerli bir müzik servisi seçiniz' })
  provider: MusicProvider;

  @IsOptional()
  @IsBoolean()
  autoStart?: boolean = true; // Görev başladığında otomatik başlasın mı?

  @IsOptional()
  @IsBoolean()
  autoStop?: boolean = true; // Görev bittiğinde otomatik dursun mu?
}
