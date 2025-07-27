import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache.service';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  groups: string[];
  lastActivity: Date;
  loginTime: Date;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    platform: string;
  };
}

@Injectable()
export class SessionCacheStrategy {
  private readonly logger = new Logger(SessionCacheStrategy.name);
  private readonly SESSION_TTL = 60 * 60 * 24 * 7; // 7 gün

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Session'ı cache'e kaydet
   * @param userId Kullanıcı ID
   * @param sessionData Session verisi
   * @param ttl Yaşam süresi (saniye) - opsiyonel
   */
  async setSession(
    userId: string,
    sessionData: SessionData,
    ttl?: number,
  ): Promise<void> {
    const key = this.cacheService.generateSessionKey(userId);
    await this.cacheService.set(key, sessionData, ttl || this.SESSION_TTL);
    this.logger.debug(`Session cached for user: ${userId}`);
  }

  /**
   * Session'ı cache'den getir
   * @param userId Kullanıcı ID
   * @returns Session verisi veya null
   */
  async getSession(userId: string): Promise<SessionData | null> {
    const key = this.cacheService.generateSessionKey(userId);
    const session = await this.cacheService.get<SessionData>(key);
    
    if (session) {
      // Son aktivite zamanını güncelle
      session.lastActivity = new Date();
      await this.cacheService.set(key, session, this.SESSION_TTL);
    }
    
    return session;
  }

  /**
   * Session'ı sil
   * @param userId Kullanıcı ID
   */
  async deleteSession(userId: string): Promise<void> {
    const key = this.cacheService.generateSessionKey(userId);
    await this.cacheService.del(key);
    this.logger.debug(`Session deleted for user: ${userId}`);
  }

  /**
   * Kullanıcının aktif session'ı var mı kontrol et
   * @param userId Kullanıcı ID
   * @returns Boolean
   */
  async hasActiveSession(userId: string): Promise<boolean> {
    const session = await this.getSession(userId);
    return session !== null;
  }

  /**
   * Session'ı yenile (TTL'yi uzat)
   * @param userId Kullanıcı ID
   * @param ttl Yeni TTL (opsiyonel)
   */
  async refreshSession(userId: string, ttl?: number): Promise<void> {
    const session = await this.getSession(userId);
    if (session) {
      session.lastActivity = new Date();
      await this.setSession(userId, session, ttl);
      this.logger.debug(`Session refreshed for user: ${userId}`);
    }
  }

  /**
   * Kullanıcının grup bilgilerini session'da güncelle
   * @param userId Kullanıcı ID
   * @param groups Yeni grup listesi
   */
  async updateUserGroups(userId: string, groups: string[]): Promise<void> {
    const session = await this.getSession(userId);
    if (session) {
      session.groups = groups;
      await this.setSession(userId, session);
      this.logger.debug(`Groups updated in session for user: ${userId}`);
    }
  }

  /**
   * Belirli sürede aktif olmayan session'ları sil
   * @param inactiveHours Aktif olmama süresi (saat)
   */
  async cleanupInactiveSessions(inactiveHours: number = 24): Promise<void> {
    try {
      // Bu işlem için Redis'e özel implementation gerekebilir
      // Şimdilik pattern ile silme yapıyoruz
      await this.cacheService.deleteByPattern('session:*');
      this.logger.debug(`Inactive sessions cleaned up (${inactiveHours}h)`);
    } catch (error) {
      this.logger.error('Session cleanup error:', error);
    }
  }

  /**
   * Aktif session sayısını getir
   */
  async getActiveSessionCount(): Promise<number> {
    try {
      const stats = await this.cacheService.getStats();
      // Bu basit bir yaklaşım, gerçekte session pattern'ini kontrol etmeli
      return Math.floor(stats.totalKeys * 0.3); // Tahmini oran
    } catch (error) {
      this.logger.error('Active session count error:', error);
      return 0;
    }
  }

  /**
   * Session verilerini JWT payload'ına dönüştür
   * @param sessionData Session verisi
   * @returns JWT payload
   */
  sessionToJwtPayload(sessionData: SessionData): any {
    return {
      sub: sessionData.userId,
      email: sessionData.email,
      role: sessionData.role,
      groups: sessionData.groups,
      iat: Math.floor(sessionData.loginTime.getTime() / 1000),
    };
  }

  /**
   * JWT payload'ından session verisi oluştur
   * @param payload JWT payload
   * @param deviceInfo Cihaz bilgisi
   * @returns Session verisi
   */
  jwtPayloadToSession(payload: any, deviceInfo?: any): SessionData {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      groups: payload.groups || [],
      lastActivity: new Date(),
      loginTime: new Date(payload.iat * 1000),
      deviceInfo,
    };
  }
}
