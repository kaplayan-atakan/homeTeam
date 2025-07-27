import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';

/**
 * Cache key pattern belirlemek için decorator
 * @param pattern Cache key pattern'i
 * @example @CacheKey('users:profile:{userId}')
 */
export const CacheKey = (pattern: string) => SetMetadata(CACHE_KEY_METADATA, pattern);
