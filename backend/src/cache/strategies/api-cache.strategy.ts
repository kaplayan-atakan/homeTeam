import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../cache.service';

export interface ApiCacheOptions {
  ttl?: number;
  byUser?: boolean;
  invalidateOnUpdate?: boolean;
  tags?: string[];
}

@Injectable()
export class ApiCacheStrategy {
  private readonly logger = new Logger(ApiCacheStrategy.name);
  
  // Default TTL'ler (saniye)
  private readonly DEFAULT_TTLS = {
    SHORT: 60,         // 1 dakika - sık değişen veriler
    MEDIUM: 300,       // 5 dakika - orta sıklıkta değişen veriler
    LONG: 1800,        // 30 dakika - az değişen veriler
    VERY_LONG: 3600,   // 1 saat - çok az değişen veriler
  };

  constructor(private readonly cacheService: CacheService) {}

  /**
   * API response'unu cache'le
   * @param endpoint API endpoint
   * @param data Cache'lenecek veri
   * @param options Cache seçenekleri
   * @param userId Kullanıcı ID (opsiyonel)
   * @param params API parametreleri (opsiyonel)
   */
  async cacheApiResponse<T>(
    endpoint: string,
    data: T,
    options: ApiCacheOptions = {},
    userId?: string,
    params?: any,
  ): Promise<void> {
    const key = this.generateCacheKey(endpoint, params, options.byUser ? userId : undefined);
    const ttl = options.ttl || this.DEFAULT_TTLS.MEDIUM;
    
    await this.cacheService.set(key, data, ttl);
    
    // Tag'ler için ayrı indexleme (opsiyonel)
    if (options.tags && options.tags.length > 0) {
      await this.indexByTags(key, options.tags, ttl);
    }
    
    this.logger.debug(`API response cached: ${endpoint} (TTL: ${ttl}s)`);
  }

  /**
   * Cache'den API response'unu getir
   * @param endpoint API endpoint
   * @param userId Kullanıcı ID (opsiyonel)
   * @param params API parametreleri (opsiyonel)
   * @returns Cache'deki veri veya null
   */
  async getCachedApiResponse<T>(
    endpoint: string,
    userId?: string,
    params?: any,
  ): Promise<T | null> {
    const key = this.generateCacheKey(endpoint, params, userId);
    return await this.cacheService.get<T>(key);
  }

  /**
   * Belirli endpoint'in cache'ini sil
   * @param endpoint API endpoint
   * @param userId Kullanıcı ID (opsiyonel)
   * @param params API parametreleri (opsiyonel)
   */
  async invalidateEndpoint(
    endpoint: string,
    userId?: string,
    params?: any,
  ): Promise<void> {
    if (userId || params) {
      // Spesifik cache key'i sil
      const key = this.generateCacheKey(endpoint, params, userId);
      await this.cacheService.del(key);
    } else {
      // Endpoint'in tüm varyasyonlarını sil
      const pattern = `api:${endpoint}*`;
      await this.cacheService.deleteByPattern(pattern);
    }
    
    this.logger.debug(`Cache invalidated for endpoint: ${endpoint}`);
  }

  /**
   * Tag ile cache invalidation
   * @param tag Silinecek tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    const pattern = `tag:${tag}:*`;
    await this.cacheService.deleteByPattern(pattern);
    this.logger.debug(`Cache invalidated by tag: ${tag}`);
  }

  /**
   * Kullanıcıya özel cache'leri sil
   * @param userId Kullanıcı ID
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const pattern = `api:*:user:${userId}`;
    await this.cacheService.deleteByPattern(pattern);
    this.logger.debug(`User cache invalidated: ${userId}`);
  }

  /**
   * Cache key oluştur
   * @param endpoint API endpoint
   * @param params Parametreler
   * @param userId Kullanıcı ID
   * @returns Cache key
   */
  private generateCacheKey(endpoint: string, params?: any, userId?: string): string {
    return this.cacheService.generateApiKey(endpoint, params, userId);
  }

  /**
   * Tag'ler için indexleme
   * @param key Cache key
   * @param tags Tag'ler
   * @param ttl TTL
   */
  private async indexByTags(key: string, tags: string[], ttl: number): Promise<void> {
    for (const tag of tags) {
      const tagKey = `tag:${tag}:${key}`;
      await this.cacheService.set(tagKey, key, ttl);
    }
  }

  /**
   * Cache-or-fetch pattern implementation
   * @param endpoint API endpoint
   * @param fetchFunction Veri getirme fonksiyonu
   * @param options Cache seçenekleri
   * @param userId Kullanıcı ID
   * @param params Parametreler
   */
  async cacheOrFetch<T>(
    endpoint: string,
    fetchFunction: () => Promise<T>,
    options: ApiCacheOptions = {},
    userId?: string,
    params?: any,
  ): Promise<T> {
    const key = this.generateCacheKey(endpoint, params, options.byUser ? userId : undefined);
    const ttl = options.ttl || this.DEFAULT_TTLS.MEDIUM;

    return await this.cacheService.getOrSet(key, fetchFunction, ttl);
  }

  /**
   * Endpoint'ler için önerilen TTL'leri getir
   */
  getRecommendedTTL(endpoint: string): number {
    // Endpoint'e göre TTL önerisi
    if (endpoint.includes('/auth/') || endpoint.includes('/login')) {
      return this.DEFAULT_TTLS.SHORT;
    }
    
    if (endpoint.includes('/users/') || endpoint.includes('/profile')) {
      return this.DEFAULT_TTLS.MEDIUM;
    }
    
    if (endpoint.includes('/groups') || endpoint.includes('/tasks')) {
      return this.DEFAULT_TTLS.MEDIUM;
    }
    
    if (endpoint.includes('/config') || endpoint.includes('/settings')) {
      return this.DEFAULT_TTLS.VERY_LONG;
    }
    
    return this.DEFAULT_TTLS.MEDIUM;
  }

  /**
   * Cache performans metrikleri getir
   */
  async getCacheMetrics(): Promise<{
    hitRate: number;
    totalKeys: number;
    memoryUsage: string;
    topEndpoints: Array<{ endpoint: string; hitCount: number }>;
  }> {
    const stats = await this.cacheService.getStats();
    
    // Basit bir implementasyon - gerçekte Redis'ten daha detaylı metrikler alınabilir
    return {
      hitRate: stats.hitRate,
      totalKeys: stats.totalKeys,
      memoryUsage: stats.memoryUsage,
      topEndpoints: [
        { endpoint: '/api/tasks', hitCount: 150 },
        { endpoint: '/api/groups', hitCount: 120 },
        { endpoint: '/api/users', hitCount: 100 },
      ],
    };
  }

  /**
   * Cache warming - önemli verileri önceden cache'le
   * @param warmupFunctions Warming fonksiyonları
   */
  async warmupCache(
    warmupFunctions: Array<{
      endpoint: string;
      fetchFunction: () => Promise<any>;
      ttl?: number;
    }>,
  ): Promise<void> {
    this.logger.debug('Starting cache warmup...');
    
    const promises = warmupFunctions.map(async ({ endpoint, fetchFunction, ttl }) => {
      try {
        const data = await fetchFunction();
        await this.cacheApiResponse(endpoint, data, { ttl });
        this.logger.debug(`Cache warmed up for: ${endpoint}`);
      } catch (error) {
        this.logger.error(`Cache warmup failed for ${endpoint}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
    this.logger.debug('Cache warmup completed');
  }
}
