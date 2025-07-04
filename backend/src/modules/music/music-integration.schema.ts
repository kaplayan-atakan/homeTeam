import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface MusicIntegrationMethods {
  isTokenExpired(): boolean;
  findPlaylistById(playlistId: string): Playlist | undefined;
  addPlaylist(playlist: Playlist): void;
  removePlaylist(playlistId: string): void;
}

export type MusicIntegrationDocument = MusicIntegration & Document & MusicIntegrationMethods;

export enum MusicProvider {
  SPOTIFY = 'spotify',
  YOUTUBE = 'youtube',
  APPLE_MUSIC = 'apple_music',
  DEEZER = 'deezer',
}

export enum PlaylistType {
  WORK = 'work',
  FOCUS = 'focus',
  CLEANING = 'cleaning',
  COOKING = 'cooking',
  EXERCISE = 'exercise',
  RELAXATION = 'relaxation',
  CUSTOM = 'custom',
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // saniye cinsinden
  url: string;
  thumbnail?: string;
  provider: MusicProvider;
  providerId: string; // Provider'daki ID
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  totalDuration: number;
  provider: MusicProvider;
  providerId: string;
  thumbnail?: string;
  isPublic: boolean;
  createdBy: Types.ObjectId;
  type: PlaylistType;
}

@Schema({ timestamps: true })
export class MusicIntegration {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: MusicProvider })
  provider: MusicProvider;

  @Prop({ required: true })
  accessToken: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ type: Object })
  providerUserData: {
    id: string;
    displayName: string;
    email?: string;
    country?: string;
    profileImage?: string;
    subscription?: string; // premium, free vs.
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [Object], default: [] })
  playlists: Playlist[];

  @Prop({ type: Object })
  preferences: {
    autoPlay: boolean;
    defaultPlaylist?: string;
    volume: number; // 0-100
    shuffle: boolean;
    repeat: boolean; // none, one, all
    crossfade: number; // saniye
  };

  @Prop({ type: Object, default: {} })
  stats: {
    totalTracksPlayed: number;
    totalPlayTime: number; // dakika
    favoriteGenres: string[];
    mostPlayedTracks: Track[];
  };

  // Token süresi dolmuş mu?
  isTokenExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  // Playlist bulma
  findPlaylistById(playlistId: string): Playlist | undefined {
    return this.playlists.find(p => p.id === playlistId);
  }

  // Playlist ekleme
  addPlaylist(playlist: Playlist): void {
    this.playlists.push(playlist);
  }

  // Playlist çıkarma
  removePlaylist(playlistId: string): void {
    this.playlists = this.playlists.filter(p => p.id !== playlistId);
  }
}

export const MusicIntegrationSchema = SchemaFactory.createForClass(MusicIntegration);

// Index'ler
MusicIntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });
MusicIntegrationSchema.index({ 'playlists.type': 1 });
MusicIntegrationSchema.index({ isActive: 1 });

// Metodları schema'ya ekle
MusicIntegrationSchema.methods.isTokenExpired = function() {
  return this.expiresAt ? new Date() > this.expiresAt : false;
};

MusicIntegrationSchema.methods.findPlaylistById = function(playlistId: string) {
  return this.playlists.find(p => p.id === playlistId);
};

MusicIntegrationSchema.methods.addPlaylist = function(playlist: Playlist) {
  this.playlists.push(playlist);
};

MusicIntegrationSchema.methods.removePlaylist = function(playlistId: string) {
  this.playlists = this.playlists.filter(p => p.id !== playlistId);
};
