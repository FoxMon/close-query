/* eslint-disable @typescript-eslint/no-explicit-any */

import { MssqlParameter } from '../connector/sqlserver/MssqlParameter';
import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { Table } from '../schema/table/Table';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { QueryResultCache } from './QueryResultCache';
import { QueryResultCacheOption } from './QueryResultCacheOption';
import { v4 as uuidv4 } from 'uuid';

/**
 * `DbQueryResultCache.ts`
 */
export class DbQueryResultCache implements QueryResultCache {
    private queryResultCacheTable: string;

    private queryResultCacheDatabase?: string;

    private queryResultCacheSchema?: string;

    constructor(protected manager: Manager) {
        const { schema } = this.manager.connector.options as any;
        const database = this.manager.connector.database;
        const cacheOptions =
            typeof this.manager.options.cache === 'object' ? this.manager.options.cache : {};
        const cacheTableName = cacheOptions.tableName || 'query-result-cache';

        this.queryResultCacheDatabase = database;
        this.queryResultCacheSchema = schema;
        this.queryResultCacheTable = this.manager.connector.buildTableName(
            cacheTableName,
            schema,
            database,
        );
    }

    async connect(): Promise<void> {}

    async disconnect(): Promise<void> {}

    async synchronize(queryExecutor?: QueryExecutor): Promise<void> {
        queryExecutor = this.getQueryExecutor(queryExecutor);

        const connector = this.manager.connector;
        const tableExist = await queryExecutor.hasTable(this.queryResultCacheTable);

        if (tableExist) {
            return;
        }

        await queryExecutor.createTable(
            new Table({
                database: this.queryResultCacheDatabase,
                schema: this.queryResultCacheSchema,
                name: this.queryResultCacheTable,
                columns: [
                    {
                        name: 'id',
                        primary: true,
                        nullable: false,
                        type: connector.normalizeType({
                            type: connector.mappedDataTypes.cacheId,
                        }),
                        generationStrategy: 'increment',
                        isGenerated: true,
                    },
                    {
                        name: 'identifier',
                        type: connector.normalizeType({
                            type: connector.mappedDataTypes.cacheIdentifier,
                        }),
                        nullable: true,
                    },
                    {
                        name: 'time',
                        type: connector.normalizeType({
                            type: connector.mappedDataTypes.cacheTime,
                        }),
                        primary: false,
                        nullable: false,
                    },
                    {
                        name: 'duration',
                        type: connector.normalizeType({
                            type: connector.mappedDataTypes.cacheDuration,
                        }),
                        primary: false,
                        nullable: false,
                    },
                    {
                        name: 'query',
                        type: connector.normalizeType({
                            type: connector.mappedDataTypes.cacheQuery,
                        }),
                        primary: false,
                        nullable: false,
                    },
                    {
                        name: 'result',
                        type: connector.normalizeType({
                            type: connector.mappedDataTypes.cacheResult,
                        }),
                        nullable: false,
                    },
                ],
            }),
        );
    }

    getFromCache(
        options: QueryResultCacheOption,
        queryExecutor?: QueryExecutor,
    ): Promise<QueryResultCacheOption | undefined> {
        queryExecutor = this.getQueryExecutor(queryExecutor);

        const qb = this.manager
            .createQueryBuilder(queryExecutor)
            .select()
            .from(this.queryResultCacheTable, 'cache');

        if (options.identifier) {
            return qb
                .where(`${qb.escape('cache')}.${qb.escape('identifier')} = :identifier`)
                .setParams({
                    identifier:
                        this.manager.connector.options.type === 'mssql'
                            ? new MssqlParameter(options.identifier, 'nvarchar')
                            : options.identifier,
                })
                .cache(false)
                .getRawOne();
        } else if (options.query) {
            return qb
                .where(`${qb.escape('cache')}.${qb.escape('query')} = :query`)
                .setParams({
                    query:
                        this.manager.connector.options.type === 'mssql'
                            ? new MssqlParameter(options.query, 'nvarchar')
                            : options.query,
                })
                .cache(false)
                .getRawOne();
        }

        return Promise.resolve(undefined);
    }

    isExpired(savedCache: QueryResultCacheOption): boolean {
        const duration =
            typeof savedCache.duration === 'string'
                ? parseInt(savedCache.duration)
                : savedCache.duration;
        return (
            (typeof savedCache.time === 'string'
                ? parseInt(savedCache.time as any)
                : savedCache.time)! +
                duration <
            new Date().getTime()
        );
    }

    async storeInCache(
        options: QueryResultCacheOption,
        savedCache: QueryResultCacheOption | undefined,
        queryExecutor?: QueryExecutor,
    ): Promise<void> {
        const shouldCreateQueryExecutor =
            queryExecutor === undefined || queryExecutor?.getReplicationMode() === 'replica';

        if (queryExecutor === undefined || shouldCreateQueryExecutor) {
            queryExecutor = this.manager.createQueryExecutor('source');
        }

        let insertedValues: ObjectIndexType = options;

        if (this.manager.connector.options.type === 'mssql') {
            insertedValues = {
                identifier: new MssqlParameter(options.identifier, 'nvarchar'),
                time: new MssqlParameter(options.time, 'bigint'),
                duration: new MssqlParameter(options.duration, 'int'),
                query: new MssqlParameter(options.query, 'nvarchar'),
                result: new MssqlParameter(options.result, 'nvarchar'),
            };
        }

        if (savedCache && savedCache.identifier) {
            const qb = queryExecutor.manager
                .createQueryBuilder()
                .update(this.queryResultCacheTable)
                .set(insertedValues);

            qb.where(`${qb.escape('identifier')} = :condition`, {
                condition: insertedValues.identifier,
            });
            await qb.execute();
        } else if (savedCache && savedCache.query) {
            const qb = queryExecutor.manager
                .createQueryBuilder()
                .update(this.queryResultCacheTable)
                .set(insertedValues);

            qb.where(`${qb.escape('query')} = :condition`, {
                condition: insertedValues.query,
            });

            await qb.execute();
        } else {
            if (!insertedValues.id) {
                insertedValues.id = uuidv4();
            }

            await queryExecutor.manager
                .createQueryBuilder()
                .insert()
                .into(this.queryResultCacheTable)
                .values(insertedValues)
                .execute();
        }

        if (shouldCreateQueryExecutor) {
            await queryExecutor.release();
        }
    }

    async clear(queryExecutor: QueryExecutor): Promise<void> {
        return this.getQueryExecutor(queryExecutor).clearTable(this.queryResultCacheTable);
    }

    async remove(identifiers: string[], queryExecutor?: QueryExecutor): Promise<void> {
        const _queryExecutor: QueryExecutor = queryExecutor || this.getQueryExecutor();

        await Promise.all(
            identifiers.map((identifier) => {
                const qb = _queryExecutor.manager.createQueryBuilder();
                return qb
                    .delete()
                    .from(this.queryResultCacheTable)
                    .where(`${qb.escape('identifier')} = :identifier`, {
                        identifier,
                    })
                    .execute();
            }),
        );

        if (!queryExecutor) {
            await _queryExecutor.release();
        }
    }

    protected getQueryExecutor(queryExecutor?: QueryExecutor): QueryExecutor {
        if (queryExecutor) {
            return queryExecutor;
        }

        return this.manager.createQueryExecutor();
    }
}
