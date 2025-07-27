import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CacheKeyOptions {
  prefix?: string;
  ttl?: number;
  tags?: string[];
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Cache'den veri getir
   * @param key Cache anahtarı
   * @returns Cache'deki veri veya null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return value || null;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Cache'e veri kaydet
   * @param key Cache anahtarı
   * @param value Kaydedilecek veri
   * @param ttl Yaşam süresi (saniye)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Cache'den veri sil
   * @param key Cache anahtarı
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * Cache'i tamamen temizle
   */
  async reset(): Promise<void> {
    try {
      // Redis specific reset implementation
      const redis = (this.cacheManager as any).store?.getClient?.();
      if (redis) {
        await redis.flushdb();
        this.logger.debug('Cache RESET: All keys cleared');
      }
    } catch (error) {
      this.logger.error('Cache RESET error:', error);
    }
  }

  /**
   * Session cache key oluştur
   * @param userId Kullanıcı ID
   * @param sessionId Session ID
   */
  generateSessionKey(userId: string, sessionId?: string): string {
    return `session:${userId}${sessionId ? `:${sessionId}` : ''}`;
  }

  /**
   * API cache key oluştur
   * @param endpoint API endpoint
   * @param params Parametreler
   * @param userId Kullanıcı ID (opsiyonel)
   */
  generateApiKey(endpoint: string, params?: any, userId?: string): string {
    const paramString = params ? `:${JSON.stringify(params)}` : '';
    const userString = userId ? `:user:${userId}` : '';
    return `api:${endpoint}${paramString}${userString}`;
  }

  /**
   * Rate limit key oluştur
   * @param identifier Tanımlayıcı (IP, user ID, vb.)
   * @param action Eylem türü
   */
  generateRateLimitKey(identifier: string, action: string): string {
    return `rate_limit:${action}:${identifier}`;
  }

  /**
   * Cache'de veri varsa getir, yoksa fonksiyonu çalıştır ve cache'le
   * @param key Cache anahtarı
   * @param fn Çalıştırılacak fonksiyon
   * @param ttl TTL (saniye)
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value = await this.get<T>(key);
    
    if (value === null) {
      this.logger.debug(`Cache MISS: ${key} - Executing function`);
      value = await fn();
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttl);
      }
    }
    
    return value;
  }

  /**
   * Belirli pattern'e sahip keyleri sil
   * @param pattern Silinecek key pattern'i
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      // Redis specific implementation
      const redis = (this.cacheManager as any).store?.getClient?.();
      if (redis) {
        const keys = await redis.keys(pattern);
        
        if (keys.length > 0) {
          await redis.del(...keys);
          this.logger.debug(`Cache DELETE by pattern: ${pattern} (${keys.length} keys)`);
        }
      }
    } catch (error) {
      this.logger.error(`Cache DELETE by pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Cache istatistiklerini getir
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    try {
      const redis = (this.cacheManager as any).store?.getClient?.();
      if (!redis) {
        return {
          totalKeys: 0,
          memoryUsage: 'Unknown',
          hitRate: 0,
        };
      }

      const info = await redis.info('memory');
      const keyCount = await redis.dbsize();
      
      // Basit hit rate hesaplaması için Redis INFO kullanabiliriz
      const stats = await redis.info('stats');
      const hitMatches = stats.match(/keyspace_hits:(\d+)/);
      const missMatches = stats.match(/keyspace_misses:(\d+)/);
      
      const hits = hitMatches ? parseInt(hitMatches[1]) : 0;
      const misses = missMatches ? parseInt(missMatches[1]) : 0;
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;

      return {
        totalKeys: keyCount,
        memoryUsage: info.match(/used_memory_human:(.+)/)?.[1] || 'Unknown',
        hitRate: Math.round(hitRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Cache STATS error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Unknown',
        hitRate: 0,
      };
    }
  }
}
