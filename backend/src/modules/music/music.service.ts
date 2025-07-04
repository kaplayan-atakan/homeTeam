import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
// import { HttpService } from '@nestjs/axios'; // Package kurulu olmadığında
// import { firstValueFrom } from 'rxjs';
import {
  MusicIntegration,
  MusicIntegrationDocument,
  MusicProvider,
  PlaylistType,
  Track,
  Playlist,
} from './music-integration.schema';
import {
  ConnectMusicProviderDto,
  RefreshTokenDto,
  CreatePlaylistDto,
  AddTrackToPlaylistDto,
  RemoveTrackFromPlaylistDto,
  UpdateMusicPreferencesDto,
  PlayMusicDto,
  SearchMusicDto,
  ImportPlaylistDto,
  RecommendationDto,
  MusicStatsDto,
  SyncPlaylistDto,
  SharePlaylistDto,
  TaskMusicMappingDto,
} from './dto/music.dto';

// SOLID: Single Responsibility Principle - Müzik entegrasyonu işlemleri için tek sorumluluk
@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);

  constructor(
    @InjectModel(MusicIntegration.name) 
    private musicIntegrationModel: Model<MusicIntegrationDocument>,
    private configService: ConfigService,
    // private httpService: HttpService, // Package kurulu olmadığında
  ) {}

  // Müzik servisi bağlantısı
  async connectProvider(
    userId: string,
    connectDto: ConnectMusicProviderDto
  ): Promise<MusicIntegration> {
    try {
      // Authorization code ile access token al
      const tokenData = await this.exchangeCodeForTokens(connectDto.provider, connectDto.authCode);
      
      // Provider'dan kullanıcı bilgilerini al
      const userInfo = await this.getProviderUserInfo(connectDto.provider, tokenData.access_token);

      // Mevcut entegrasyonu güncelle veya yenisini oluştur
      const integration = await this.musicIntegrationModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId), provider: connectDto.provider },
        {
          userId: new Types.ObjectId(userId),
          provider: connectDto.provider,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
          providerUserData: userInfo,
          isActive: true,
          preferences: {
            autoPlay: true,
            volume: 70,
            shuffle: false,
            repeat: false,
            crossfade: 0,
          },
          stats: {
            totalTracksPlayed: 0,
            totalPlayTime: 0,
            favoriteGenres: [],
            mostPlayedTracks: [],
          }
        },
        { upsert: true, new: true }
      );

      // Kullanıcının mevcut playlist'lerini sync et
      await this.syncUserPlaylists(integration);

      this.logger.log(`${connectDto.provider} entegrasyonu başarılı: ${userId}`);
      return integration;
    } catch (error) {
      this.logger.error('Provider bağlantı hatası:', error);
      throw new BadRequestException('Müzik servisi bağlantısı kurulamadı');
    }
  }

  // Token yenileme
  async refreshToken(userId: string, refreshDto: RefreshTokenDto): Promise<MusicIntegration> {
    const integration = await this.findIntegration(userId, refreshDto.provider);

    if (!integration.refreshToken) {
      throw new BadRequestException('Refresh token bulunamadı');
    }

    try {
      const tokenData = await this.refreshAccessToken(refreshDto.provider, integration.refreshToken);

      integration.accessToken = tokenData.access_token;
      if (tokenData.refresh_token) {
        integration.refreshToken = tokenData.refresh_token;
      }
      integration.expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

      return integration.save();
    } catch (error) {
      this.logger.error('Token yenileme hatası:', error);
      throw new UnauthorizedException('Token yenilenemedi');
    }
  }

  // Kullanıcının müzik entegrasyonlarını getirme
  async getUserIntegrations(userId: string): Promise<MusicIntegration[]> {
    return this.musicIntegrationModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true
    });
  }

  // Entegrasyon silme
  async disconnectProvider(userId: string, provider: MusicProvider): Promise<void> {
    await this.musicIntegrationModel.updateOne(
      { userId: new Types.ObjectId(userId), provider },
      { isActive: false }
    );
  }

  // Playlist oluşturma
  async createPlaylist(
    userId: string,
    createDto: CreatePlaylistDto
  ): Promise<Playlist> {
    // Tüm aktif entegrasyonlardan birini seç (varsayılan olarak Spotify)
    const integrations = await this.getUserIntegrations(userId);
    const integration = integrations.find(i => i.provider === MusicProvider.SPOTIFY) || integrations[0];

    if (!integration) {
      throw new NotFoundException('Aktif müzik servisi entegrasyonu bulunamadı');
    }

    try {
      const playlist = await this.createProviderPlaylist(integration, createDto);
      
      integration.addPlaylist(playlist);
      await integration.save();

      return playlist;
    } catch (error) {
      this.logger.error('Playlist oluşturma hatası:', error);
      throw new BadRequestException('Playlist oluşturulamadı');
    }
  }

  // Müzik arama
  async searchMusic(userId: string, searchDto: SearchMusicDto): Promise<any> {
    const integration = await this.findIntegration(userId, searchDto.provider);
    
    try {
      return await this.searchInProvider(integration, searchDto);
    } catch (error) {
      this.logger.error('Müzik arama hatası:', error);
      throw new BadRequestException('Arama yapılamadı');
    }
  }

  // Müzik çalma
  async playMusic(userId: string, playDto: PlayMusicDto): Promise<any> {
    const integration = await this.findIntegration(userId, playDto.provider);

    try {
      const result = await this.startPlayback(integration, playDto);
      
      // İstatistikleri güncelle
      integration.stats.totalTracksPlayed += 1;
      await integration.save();

      return result;
    } catch (error) {
      this.logger.error('Müzik çalma hatası:', error);
      throw new BadRequestException('Müzik çalınamadı');
    }
  }

  // Öneri alma
  async getRecommendations(userId: string, recommendationDto: RecommendationDto): Promise<Track[]> {
    const integration = await this.findIntegration(userId, recommendationDto.provider);

    try {
      return await this.getProviderRecommendations(integration, recommendationDto);
    } catch (error) {
      this.logger.error('Öneri alma hatası:', error);
      throw new BadRequestException('Öneriler alınamadı');
    }
  }

  // Görev-müzik eşleşmesi
  async mapTaskToMusic(userId: string, mappingDto: TaskMusicMappingDto): Promise<void> {
    const integration = await this.findIntegration(userId, mappingDto.provider);
    const playlist = integration.findPlaylistById(mappingDto.playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist bulunamadı');
    }

    // TODO: Task modülü ile entegrasyon
    // await this.taskService.setTaskMusicMapping(mappingDto.taskId, mappingDto);

    this.logger.log(`Görev-müzik eşleşmesi: ${mappingDto.taskId} -> ${mappingDto.playlistId}`);
  }

  // İstatistik alma
  async getMusicStats(userId: string, statsDto: MusicStatsDto): Promise<any> {
    const query: any = { userId: new Types.ObjectId(userId) };
    
    if (statsDto.provider) {
      query.provider = statsDto.provider;
    }

    const integrations = await this.musicIntegrationModel.find(query);
    
    return {
      totalIntegrations: integrations.length,
      totalPlaylists: integrations.reduce((sum, i) => sum + i.playlists.length, 0),
      totalPlayTime: integrations.reduce((sum, i) => sum + i.stats.totalPlayTime, 0),
      totalTracksPlayed: integrations.reduce((sum, i) => sum + i.stats.totalTracksPlayed, 0),
      providers: integrations.map(i => i.provider),
    };
  }

  // Yardımcı metodlar
  private async findIntegration(userId: string, provider: MusicProvider): Promise<MusicIntegrationDocument> {
    const integration = await this.musicIntegrationModel.findOne({
      userId: new Types.ObjectId(userId),
      provider,
      isActive: true
    });

    if (!integration) {
      throw new NotFoundException(`${provider} entegrasyonu bulunamadı`);
    }

    // Token süresi kontrolü
    if (integration.isTokenExpired()) {
      if (integration.refreshToken) {
        return this.refreshToken(userId, { provider });
      } else {
        throw new UnauthorizedException('Token süresi dolmuş, yeniden bağlantı gerekli');
      }
    }

    return integration;
  }

  // Provider API çağrıları (stub implementations)
  private async exchangeCodeForTokens(provider: MusicProvider, authCode: string): Promise<any> {
    switch (provider) {
      case MusicProvider.SPOTIFY:
        return this.spotifyExchangeCode(authCode);
      case MusicProvider.YOUTUBE:
        return this.youtubeExchangeCode(authCode);
      default:
        throw new BadRequestException('Desteklenmeyen provider');
    }
  }

  private async getProviderUserInfo(provider: MusicProvider, accessToken: string): Promise<any> {
    switch (provider) {
      case MusicProvider.SPOTIFY:
        return this.getSpotifyUserInfo(accessToken);
      case MusicProvider.YOUTUBE:
        return this.getYouTubeUserInfo(accessToken);
      default:
        throw new BadRequestException('Desteklenmeyen provider');
    }
  }

  private async refreshAccessToken(provider: MusicProvider, refreshToken: string): Promise<any> {
    switch (provider) {
      case MusicProvider.SPOTIFY:
        return this.refreshSpotifyToken(refreshToken);
      case MusicProvider.YOUTUBE:
        return this.refreshYouTubeToken(refreshToken);
      default:
        throw new BadRequestException('Desteklenmeyen provider');
    }
  }

  private async syncUserPlaylists(integration: MusicIntegrationDocument): Promise<void> {
    try {
      const playlists = await this.getProviderPlaylists(integration);
      integration.playlists = playlists;
      await integration.save();
    } catch (error) {
      this.logger.error('Playlist sync hatası:', error);
    }
  }

  // Spotify API çağrıları (stub)
  private async spotifyExchangeCode(authCode: string): Promise<any> {
    // TODO: Spotify API entegrasyonu
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600
    };
  }

  private async getSpotifyUserInfo(accessToken: string): Promise<any> {
    // TODO: Spotify API entegrasyonu
    return {
      id: 'user123',
      displayName: 'Test User',
      email: 'test@example.com',
      country: 'TR',
      subscription: 'premium'
    };
  }

  private async refreshSpotifyToken(refreshToken: string): Promise<any> {
    // TODO: Spotify API entegrasyonu
    return {
      access_token: 'new_access_token',
      expires_in: 3600
    };
  }

  private async getProviderPlaylists(integration: MusicIntegrationDocument): Promise<Playlist[]> {
    // TODO: Provider API'den playlist'leri çek
    return [];
  }

  private async createProviderPlaylist(integration: MusicIntegrationDocument, createDto: CreatePlaylistDto): Promise<Playlist> {
    // TODO: Provider API'de playlist oluştur
    return {
      id: `playlist_${Date.now()}`,
      name: createDto.name,
      description: createDto.description,
      tracks: [],
      totalDuration: 0,
      provider: integration.provider,
      providerId: `provider_${Date.now()}`,
      isPublic: createDto.isPublic || false,
      createdBy: integration.userId,
      type: createDto.type,
    };
  }

  private async searchInProvider(integration: MusicIntegrationDocument, searchDto: SearchMusicDto): Promise<any> {
    // TODO: Provider API'de arama yap
    return {
      tracks: [],
      albums: [],
      artists: [],
      playlists: []
    };
  }

  private async startPlayback(integration: MusicIntegrationDocument, playDto: PlayMusicDto): Promise<any> {
    // TODO: Provider API'de çalmayı başlat
    return {
      isPlaying: true,
      currentTrack: null
    };
  }

  private async getProviderRecommendations(integration: MusicIntegrationDocument, recommendationDto: RecommendationDto): Promise<Track[]> {
    // TODO: Provider API'den öneri al
    return [];
  }

  // YouTube API çağrıları (stub)
  private async youtubeExchangeCode(authCode: string): Promise<any> {
    // TODO: YouTube API entegrasyonu
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600
    };
  }

  private async getYouTubeUserInfo(accessToken: string): Promise<any> {
    // TODO: YouTube API entegrasyonu
    return {
      id: 'user123',
      displayName: 'Test User',
      email: 'test@example.com'
    };
  }

  private async refreshYouTubeToken(refreshToken: string): Promise<any> {
    // TODO: YouTube API entegrasyonu
    return {
      access_token: 'new_access_token',
      expires_in: 3600
    };
  }
}
