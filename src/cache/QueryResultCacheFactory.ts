/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from '../error/CQError';
import { Manager } from '../manager/Manager';
import { DbQueryResultCache } from './DbQueryResultCache';
import { QueryResultCache } from './QueryResultCache';
import { RedisQueryResultCache } from './RedisQueryResultCache';

export class QueryResultCacheFactory {
    constructor(protected manager: Manager) {}

    create(): QueryResultCache {
        if (!this.manager.options.cache)
            throw new CQError(
                `To use cache you need to enable it in connection options by setting cache: true or providing some caching options. Example: { host: ..., username: ..., cache: true }`,
            );

        const cache: any = this.manager.options.cache;

        if (cache.provider && typeof cache.provider === 'function') {
            return cache.provider(this.manager);
        }

        if (
            cache.type === 'redis' ||
            cache.type === 'ioredis' ||
            cache.type === 'ioredis/cluster'
        ) {
            return new RedisQueryResultCache(this.manager, cache.type);
        } else {
            return new DbQueryResultCache(this.manager);
        }
    }
}
