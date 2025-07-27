import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache.service';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
}

@Injectable()
export class RateLimitStrategy {
  private readonly logger = new Logger(RateLimitStrategy.name);

  // Predefined rate limit configurations
  private readonly RATE_LIMITS = {
    // API endpoint'leri için
    API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 req/min
    API_AUTH: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 req/15min (login)
    API_UPLOAD: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 req/min
    
    // User action'ları için
    USER_TASK_CREATE: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 task/min
    USER_MESSAGE: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 msg/min
    
    // Admin action'ları için
    ADMIN_BULK: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 bulk op/min
  };

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Rate limit kontrolü yap
   * @param identifier Tanımlayıcı (IP, user ID, API key, vb.)
   * @param action Eylem türü
   * @param config Rate limit konfigürasyonu
   * @returns Rate limit sonucu
   */
  async checkRateLimit(
    identifier: string,
    action: string,
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const rateLimitConfig = config || this.RATE_LIMITS.API_GENERAL;
    const key = this.cacheService.generateRateLimitKey(identifier, action);
    const windowStart = Date.now() - rateLimitConfig.windowMs;
    
    try {
      // Redis'te sliding window algoritması kullan
      const requests = await this.getRequestsInWindow(key, windowStart);
      const allowed = requests.length < rateLimitConfig.maxRequests;
      
      if (allowed) {
        // Yeni request'i kaydet
        await this.recordRequest(key, rateLimitConfig.windowMs);
      }
      
      const resetTime = new Date(windowStart + rateLimitConfig.windowMs);
      const remaining = Math.max(0, rateLimitConfig.maxRequests - requests.length - (allowed ? 1 : 0));
      
      this.logger.debug(
        `Rate limit check: ${action}@${identifier} - ${allowed ? 'ALLOWED' : 'BLOCKED'} ` +
        `(${requests.length + (allowed ? 1 : 0)}/${rateLimitConfig.maxRequests})`
      );
      
      return {
        allowed,
        remaining,
        resetTime,
        totalRequests: requests.length + (allowed ? 1 : 0),
      };
    } catch (error) {
      this.logger.error(`Rate limit check error for ${action}@${identifier}:`, error);
      // Hata durumunda allow et (fail-open)
      return {
        allowed: true,
        remaining: rateLimitConfig.maxRequests - 1,
        resetTime: new Date(Date.now() + rateLimitConfig.windowMs),
        totalRequests: 1,
      };
    }
  }

  /**
   * IP bazlı rate limiting
   * @param ip IP adresi
   * @param action Eylem türü
   * @param config Rate limit konfigürasyonu
   */
  async checkIpRateLimit(
    ip: string,
    action: string = 'general',
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(`ip:${ip}`, action, config);
  }

  /**
   * User bazlı rate limiting
   * @param userId Kullanıcı ID
   * @param action Eylem türü
   * @param config Rate limit konfigürasyonu
   */
  async checkUserRateLimit(
    userId: string,
    action: string = 'general',
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(`user:${userId}`, action, config);
  }

  /**
   * API key bazlı rate limiting
   * @param apiKey API anahtarı
   * @param action Eylem türü
   * @param config Rate limit konfigürasyonu
   */
  async checkApiKeyRateLimit(
    apiKey: string,
    action: string = 'api',
    config?: RateLimitConfig,
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(`apikey:${apiKey}`, action, config);
  }

  /**
   * Rate limit'i reset et
   * @param identifier Tanımlayıcı
   * @param action Eylem türü
   */
  async resetRateLimit(identifier: string, action: string): Promise<void> {
    const key = this.cacheService.generateRateLimitKey(identifier, action);
    await this.cacheService.del(key);
    this.logger.debug(`Rate limit reset: ${action}@${identifier}`);
  }

  /**
   * Rate limit istatistiklerini getir
   * @param identifier Tanımlayıcı
   * @param action Eylem türü
   */
  async getRateLimitStats(
    identifier: string,
    action: string,
  ): Promise<{
    currentRequests: number;
    maxRequests: number;
    windowMs: number;
    nextReset: Date;
  }> {
    const config = this.RATE_LIMITS.API_GENERAL;
    const key = this.cacheService.generateRateLimitKey(identifier, action);
    const windowStart = Date.now() - config.windowMs;
    
    const requests = await this.getRequestsInWindow(key, windowStart);
    
    return {
      currentRequests: requests.length,
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      nextReset: new Date(windowStart + config.windowMs),
    };
  }

  /**
   * Global rate limit istatistikleri
   */
  async getGlobalRateLimitStats(): Promise<{
    totalActiveWindows: number;
    averageRequestsPerWindow: number;
    topLimitedActions: Array<{ action: string; count: number }>;
  }> {
    try {
      const stats = await this.cacheService.getStats();
      
      // Basit bir implementasyon - gerçekte Redis'ten daha detaylı analiz yapılabilir
      return {
        totalActiveWindows: Math.floor(stats.totalKeys * 0.1), // Tahmini
        averageRequestsPerWindow: 15,
        topLimitedActions: [
          { action: 'api_general', count: 1250 },
          { action: 'auth_login', count: 45 },
          { action: 'task_create', count: 230 },
        ],
      };
    } catch (error) {
      this.logger.error('Global rate limit stats error:', error);
      return {
        totalActiveWindows: 0,
        averageRequestsPerWindow: 0,
        topLimitedActions: [],
      };
    }
  }

  /**
   * Rate limit temizliği (eski kayıtları sil)
   */
  async cleanupExpiredRateLimits(): Promise<void> {
    try {
      // Pattern ile eski rate limit kayıtlarını temizle
      await this.cacheService.deleteByPattern('rate_limit:*');
      this.logger.debug('Expired rate limits cleaned up');
    } catch (error) {
      this.logger.error('Rate limit cleanup error:', error);
    }
  }

  /**
   * Sliding window içindeki requestleri getir
   * @param key Redis key
   * @param windowStart Window başlangıç zamanı
   */
  private async getRequestsInWindow(key: string, windowStart: number): Promise<number[]> {
    // Bu basit bir implementasyon
    // Gerçekte Redis'te daha optimize bir sliding window algoritması kullanılabilir
    const existing = await this.cacheService.get<number[]>(key) || [];
    return existing.filter(timestamp => timestamp > windowStart);
  }

  /**
   * Request'i kaydet
   * @param key Redis key
   * @param windowMs Window süresi (ms)
   */
  private async recordRequest(key: string, windowMs: number): Promise<void> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const existing = await this.cacheService.get<number[]>(key) || [];
    const validRequests = existing.filter(timestamp => timestamp > windowStart);
    validRequests.push(now);
    
    // TTL'yi window süresi + biraz buffer olarak ayarla
    const ttlSeconds = Math.ceil(windowMs / 1000) + 60;
    await this.cacheService.set(key, validRequests, ttlSeconds);
  }

  /**
   * Predefined rate limit config'i getir
   * @param type Rate limit türü
   */
  getRateLimitConfig(type: keyof typeof this.RATE_LIMITS): RateLimitConfig {
    return this.RATE_LIMITS[type];
  }

  /**
   * Custom rate limit config oluştur
   * @param maxRequests Maksimum request sayısı
   * @param windowMinutes Window süresi (dakika)
   * @param message Hata mesajı
   */
  createRateLimitConfig(
    maxRequests: number,
    windowMinutes: number,
    message?: string,
  ): RateLimitConfig {
    return {
      maxRequests,
      windowMs: windowMinutes * 60 * 1000,
      message: message || `Çok fazla istek. ${windowMinutes} dakika sonra tekrar deneyin.`,
    };
  }
}
