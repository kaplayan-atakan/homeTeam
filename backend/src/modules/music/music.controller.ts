import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MusicService } from './music.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MusicProvider } from './music-integration.schema';

@Controller('music')
@UseGuards(JwtAuthGuard)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post('connect')
  @HttpCode(HttpStatus.OK)
  async connectProvider(@Body() connectDto: ConnectMusicProviderDto, @Request() req) {
    try {
      const integration = await this.musicService.connectProvider(req.user.userId, connectDto);
      return {
        success: true,
        message: 'Müzik servisi başarıyla bağlandı',
        data: integration,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Müzik servisi bağlanırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshDto: RefreshTokenDto, @Request() req) {
    try {
      const integration = await this.musicService.refreshToken(req.user.userId, refreshDto);
      return {
        success: true,
        message: 'Token başarıyla yenilendi',
        data: integration,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token yenilenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('integrations')
  async getUserIntegrations(@Request() req) {
    try {
      const integrations = await this.musicService.getUserIntegrations(req.user.userId);
      return {
        success: true,
        message: 'Müzik entegrasyonları başarıyla listelendi',
        data: integrations,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Entegrasyonlar listelenirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Delete('disconnect/:provider')
  @HttpCode(HttpStatus.OK)
  async disconnectProvider(@Param('provider') provider: MusicProvider, @Request() req) {
    try {
      await this.musicService.disconnectProvider(req.user.userId, provider);
      return {
        success: true,
        message: 'Müzik servisi bağlantısı kesildi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bağlantı kesilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('playlists')
  @HttpCode(HttpStatus.CREATED)
  async createPlaylist(@Body() createDto: CreatePlaylistDto, @Request() req) {
    try {
      const playlist = await this.musicService.createPlaylist(req.user.userId, createDto);
      return {
        success: true,
        message: 'Playlist başarıyla oluşturuldu',
        data: playlist,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Playlist oluşturulurken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('search')
  async searchMusic(@Query() searchDto: SearchMusicDto, @Request() req) {
    try {
      const results = await this.musicService.searchMusic(req.user.userId, searchDto);
      return {
        success: true,
        message: 'Arama başarıyla tamamlandı',
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Arama yapılırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('play')
  @HttpCode(HttpStatus.OK)
  async playMusic(@Body() playDto: PlayMusicDto, @Request() req) {
    try {
      const result = await this.musicService.playMusic(req.user.userId, playDto);
      return {
        success: true,
        message: 'Müzik çalmaya başladı',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Müzik çalınırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('recommendations')
  async getRecommendations(@Query() recommendationDto: RecommendationDto, @Request() req) {
    try {
      const recommendations = await this.musicService.getRecommendations(req.user.userId, recommendationDto);
      return {
        success: true,
        message: 'Öneriler başarıyla getirildi',
        data: recommendations,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Öneriler getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('task-mapping')
  @HttpCode(HttpStatus.OK)
  async mapTaskToMusic(@Body() mappingDto: TaskMusicMappingDto, @Request() req) {
    try {
      await this.musicService.mapTaskToMusic(req.user.userId, mappingDto);
      return {
        success: true,
        message: 'Görev-müzik eşleşmesi başarıyla kaydedildi',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Eşleşme kaydedilirken hata oluştu',
        error: error.message,
      };
    }
  }

  @Get('stats')
  async getMusicStats(@Query() statsDto: MusicStatsDto, @Request() req) {
    try {
      const stats = await this.musicService.getMusicStats(req.user.userId, statsDto);
      return {
        success: true,
        message: 'Müzik istatistikleri başarıyla getirildi',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'İstatistikler getirilirken hata oluştu',
        error: error.message,
      };
    }
  }

  // Hızlı işlemler için endpoint'ler
  @Post('quick/spotify-auth')
  @HttpCode(HttpStatus.OK)
  async quickSpotifyAuth(@Body() { authCode }: { authCode: string }, @Request() req) {
    try {
      const integration = await this.musicService.connectProvider(req.user.userId, {
        provider: MusicProvider.SPOTIFY,
        authCode,
      });
      return {
        success: true,
        message: 'Spotify başarıyla bağlandı',
        data: integration,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Spotify bağlanırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('quick/youtube-auth')
  @HttpCode(HttpStatus.OK)
  async quickYouTubeAuth(@Body() { authCode }: { authCode: string }, @Request() req) {
    try {
      const integration = await this.musicService.connectProvider(req.user.userId, {
        provider: MusicProvider.YOUTUBE,
        authCode,
      });
      return {
        success: true,
        message: 'YouTube başarıyla bağlandı',
        data: integration,
      };
    } catch (error) {
      return {
        success: false,
        message: 'YouTube bağlanırken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('quick/work-playlist')
  @HttpCode(HttpStatus.CREATED)
  async createWorkPlaylist(@Body() { name, description }: { name: string; description?: string }, @Request() req) {
    try {
      const playlist = await this.musicService.createPlaylist(req.user.userId, {
        name,
        description,
        type: 'work' as any,
        isPublic: false,
      });
      return {
        success: true,
        message: 'Çalışma playlist\'i oluşturuldu',
        data: playlist,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Playlist oluşturulurken hata oluştu',
        error: error.message,
      };
    }
  }

  @Post('quick/stop-all')
  @HttpCode(HttpStatus.OK)
  async stopAllMusic(@Request() req) {
    try {
      // TODO: Tüm aktif müzikleri durdur
      return {
        success: true,
        message: 'Tüm müzik durduruldu',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Müzik durdurulurken hata oluştu',
        error: error.message,
      };
    }
  }
}
