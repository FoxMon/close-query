/* eslint-disable @typescript-eslint/no-explicit-any */

import { DialectPlatform } from '../dialect/DialectPlatform';
import { CQError } from '../error/CQError';
import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { QueryResultCache } from './QueryResultCache';
import { QueryResultCacheOption } from './QueryResultCacheOption';

/**
 * `RedisQueryResultCache.ts`
 */
export class RedisQueryResultCache implements QueryResultCache {
    protected redis: any;

    protected client: any;

    protected clientType: 'redis' | 'ioredis' | 'ioredis/cluster';

    constructor(
        protected manager: Manager,
        clientType: 'redis' | 'ioredis' | 'ioredis/cluster',
    ) {
        this.clientType = clientType;
        this.redis = this.loadRedis();
    }

    async connect(): Promise<void> {
        const cacheOptions: any = this.manager.options.cache;
        if (this.clientType === 'redis') {
            this.client = this.redis.createClient({
                ...cacheOptions?.options,
                legacyMode: true,
            });

            if (
                typeof this.manager.options.cache === 'object' &&
                this.manager.options.cache.ignoreErrors
            ) {
                this.client.on('error', (err: any) => {
                    this.manager.logger.log('warn', err);
                });
            }

            if ('connect' in this.client) {
                await this.client.connect();
            }
        } else if (this.clientType === 'ioredis') {
            if (cacheOptions && cacheOptions.port) {
                if (cacheOptions.options) {
                    this.client = new this.redis(cacheOptions.port, cacheOptions.options);
                } else {
                    this.client = new this.redis(cacheOptions.port);
                }
            } else if (cacheOptions && cacheOptions.options) {
                this.client = new this.redis(cacheOptions.options);
            } else {
                this.client = new this.redis();
            }
        } else if (this.clientType === 'ioredis/cluster') {
            if (cacheOptions && cacheOptions.options && Array.isArray(cacheOptions.options)) {
                this.client = new this.redis.Cluster(cacheOptions.options);
            } else if (cacheOptions && cacheOptions.options && cacheOptions.options.startupNodes) {
                this.client = new this.redis.Cluster(
                    cacheOptions.options.startupNodes,
                    cacheOptions.options.options,
                );
            } else {
                throw new CQError(`options.startupNodes required for ${this.clientType}.`);
            }
        }
    }

    async disconnect(): Promise<void> {
        return new Promise<void>((ok, fail) => {
            this.client.quit((err: any, _result: any) => {
                if (err) {
                    return fail(err);
                }

                ok();

                this.client = undefined;
            });
        });
    }

    async synchronize(_queryExecutor: QueryExecutor): Promise<void> {}

    getFromCache(
        options: QueryResultCacheOption,
        _queryExecutor?: QueryExecutor,
    ): Promise<QueryResultCacheOption | undefined> {
        return new Promise<QueryResultCacheOption | undefined>((ok, fail) => {
            if (options.identifier) {
                this.client.get(options.identifier, (err: any, result: any) => {
                    if (err) return fail(err);
                    ok(JSON.parse(result));
                });
            } else if (options.query) {
                this.client.get(options.query, (err: any, result: any) => {
                    if (err) return fail(err);
                    ok(JSON.parse(result));
                });
            } else {
                ok(undefined);
            }
        });
    }

    isExpired(savedCache: QueryResultCacheOption): boolean {
        return savedCache.time! + savedCache.duration < new Date().getTime();
    }

    async storeInCache(
        options: QueryResultCacheOption,
        _savedCache: QueryResultCacheOption,
        _queryExecutor?: QueryExecutor,
    ): Promise<void> {
        return new Promise<void>((ok, fail) => {
            if (options.identifier) {
                this.client.set(
                    options.identifier,
                    JSON.stringify(options),
                    'PX',
                    options.duration,
                    (err: any, _result: any) => {
                        if (err) {
                            return fail(err);
                        }

                        ok();
                    },
                );
            } else if (options.query) {
                this.client.set(
                    options.query,
                    JSON.stringify(options),
                    'PX',
                    options.duration,
                    (err: any, _result: any) => {
                        if (err) {
                            return fail(err);
                        }

                        ok();
                    },
                );
            }
        });
    }

    async clear(_queryExecutor?: QueryExecutor): Promise<void> {
        return new Promise<void>((ok, fail) => {
            this.client.flushdb((err: any, _result: any) => {
                if (err) {
                    return fail(err);
                }

                ok();
            });
        });
    }

    async remove(identifiers: string[], _queryExecutor?: QueryExecutor): Promise<void> {
        await Promise.all(
            identifiers.map((identifier) => {
                return this.deleteKey(identifier);
            }),
        );
    }
    protected deleteKey(key: string): Promise<void> {
        return new Promise<void>((ok, fail) => {
            this.client.del(key, (err: any, _result: any) => {
                if (err) {
                    return fail(err);
                }

                ok();
            });
        });
    }

    protected loadRedis(): any {
        try {
            if (this.clientType === 'ioredis/cluster') {
                return DialectPlatform.load('ioredis');
            } else {
                return DialectPlatform.load(this.clientType);
            }
        } catch (e) {
            throw new CQError(
                `Cannot use cache because ${this.clientType} is not installed. Please run "npm i ${this.clientType} --save".`,
            );
        }
    }
}
