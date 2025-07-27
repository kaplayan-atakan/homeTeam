import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_METADATA = 'cache:ttl';

/**
 * Cache TTL (Time To Live) belirlemek için decorator
 * @param seconds TTL saniye cinsinden
 * @example @CacheTTL(300) // 5 dakika
 */
export const CacheTTL = (seconds: number) => SetMetadata(CACHE_TTL_METADATA, seconds);
