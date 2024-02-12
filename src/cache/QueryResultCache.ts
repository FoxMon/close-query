import { QueryExecutor } from '../query/executor/QueryExecutor';
import { QueryResultCacheOptions } from './QueryResultCacheOption';

/**
 * `QueryResultCache.ts`
 */
export interface QueryResultCache {
    connect(): Promise<void>;

    disconnect(): Promise<void>;

    synchronize(queryExecutor?: QueryExecutor): Promise<void>;

    getFromCache(
        options: QueryResultCacheOptions,
        queryExecutor?: QueryExecutor,
    ): Promise<QueryResultCacheOptions | undefined>;

    storeInCache(
        options: QueryResultCacheOptions,
        savedCache: QueryResultCacheOptions | undefined,
        queryExecutor?: QueryExecutor,
    ): Promise<void>;

    isExpired(savedCache: QueryResultCacheOptions): boolean;

    clear(queryExecutor?: QueryExecutor): Promise<void>;

    remove(identifiers: string[], queryExecutor?: QueryExecutor): Promise<void>;
}
