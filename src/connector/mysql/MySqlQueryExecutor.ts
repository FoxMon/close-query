/* eslint-disable @typescript-eslint/no-explicit-any */
import { CQError } from '../../error/CQError';
import { QueryExecutorAlreadyReleasedError } from '../../error/QueryExecutorAlreadyReleasedError';
import { QueryFailedError } from '../../error/QueryFailedError';
import { EventBroadCaster } from '../../event/EventBroadCaster';
import { EventResult } from '../../event/EventResult';
import { QueryStore } from '../../query/QueryStore';
import { QueryExecutor } from '../../query/executor/QueryExecutor';
import { QueryResult } from '../../query/executor/QueryResult';
import { SuperQueryExecutor } from '../../query/executor/SuperQueryExecutor';
import { Table } from '../../schema/table/Table';
import { Replication } from '../../types/Replication';
import { MysqlConnector } from './MysqlConnector';

/**
 * `MySqlQueryExecutor.ts`
 *
 * MySQL의 Query를 실행할 수 있도록 해주는 class를 정의한다.
 */
export class MySqlQueryExecutor extends SuperQueryExecutor implements QueryExecutor {
    connector: MysqlConnector;

    databaseConnectorPromise: Promise<any>;

    constructor(connector: MysqlConnector, mode: Replication) {
        super();

        this.connector = connector;

        this.manager = connector.manager;

        this.replicationMode = mode;

        this.eventBroadCaster = new EventBroadCaster(this);
    }

    async query(query: string, params?: any[], useStructuredResult = false): Promise<any> {
        if (this.isReleased) {
            throw new QueryExecutorAlreadyReleasedError();
        }

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const eventResult = new EventResult();

            try {
                const dbConnection = await this.initialize();

                this.eventBroadCaster.broadcastBeforeQueryEvent(eventResult, query, params);

                const queryStartTime = +new Date();

                dbConnection.query(query, params, async (error: any, raw: any) => {
                    const maxQueryExecutionTime = this.manager.options.maxQueryExecutionTime;
                    const queryEndTime = +new Date();
                    const queryExecutionTime = queryEndTime - queryStartTime;

                    if (maxQueryExecutionTime && queryExecutionTime > maxQueryExecutionTime) {
                        /**
                         * @TODO 시간 초과시? 로깅에 대한 뭔가 해야함
                         */
                    }

                    if (error) {
                        /**
                         * @TODO Error 발생시? 로깅에 대한 뭔가 해야함
                         */

                        this.eventBroadCaster.broadcastAfterQueryEvent(
                            eventResult,
                            query,
                            params,
                            false,
                            undefined,
                            undefined,
                            error,
                        );

                        return reject(new QueryFailedError(query, params, error));
                    }

                    this.eventBroadCaster.broadcastAfterQueryEvent(
                        eventResult,
                        query,
                        params,
                        true,
                        queryExecutionTime,
                        raw,
                        undefined,
                    );

                    const queryResult = new QueryResult();

                    queryResult.raw = raw;
                    queryResult.records = Array.from(raw);

                    // eslint-disable-next-line no-prototype-builtins
                    if (raw?.hasOwnProperty('affectedRows')) {
                        queryResult.affected = raw.affectedRows;
                    }

                    if (useStructuredResult) {
                        resolve(queryResult);
                    } else {
                        resolve(queryResult.raw);
                    }
                });
            } catch (error) {
                reject(error);
            } finally {
                eventResult.wait();
            }
        });
    }

    loadTables(tablePaths?: string[] | undefined): Promise<Table[]> {
        throw new Error('Method not implemented.');
    }

    initialize(): Promise<any> {
        if (this.databaseConnector) {
            return Promise.resolve(this.databaseConnector);
        }

        if (this.databaseConnectorPromise) {
            return this.databaseConnectorPromise;
        }

        /**
         * @TODO Replication 각각 조건 분기
         */

        return this.databaseConnectorPromise;
    }

    release(): Promise<void> {
        this.isReleased = true;

        if (this.databaseConnector) {
            this.databaseConnector.release();
        }

        return Promise.resolve();
    }

    async hasDatabase(database: string): Promise<boolean> {
        return (
            await this.query(
                `SELECT * FROM \`INFORMATION_SCHEMA\`.\`SCHEMATA\` WHERE \`SCHEMA_NAME\` = '${database}'`,
            )
        ).length
            ? true
            : false;
    }

    async createDatabase(database: string, ifNotExist?: boolean | undefined) {
        const upQuery = ifNotExist
            ? `CREATE DATABASE IF NOT EXISTS \`${database}\``
            : `CREATE DATABASE \`${database}\``;
        const downQuery = `DROP DATABASE \`${database}\``;

        await this.executeQueries(new QueryStore(upQuery), new QueryStore(downQuery));
    }

    async dropDatabase(database: string, ifExist?: boolean | undefined) {
        const upQuery = ifExist
            ? `DROP DATABASE IF EXISTS \`${database}\``
            : `DROP DATABASE \`${database}\``;
        const downQuery = `CREATE DATABASE \`${database}\``;

        await this.executeQueries(new QueryStore(upQuery), new QueryStore(downQuery));
    }

    async createSchema(_schemaPath: string, _ifNotExist?: boolean | undefined) {
        throw new CQError(`Create schema query is not supported...!`);
    }

    async dropSchema(
        _schemaPath: string,
        _ifExist?: boolean | undefined,
        _isCascade?: boolean | undefined,
    ) {
        throw new CQError(`Drop schema query is not supported...!`);
    }

    async clearDatabase(database?: string): Promise<void> {
        const databaseName = database ? database : this.connector.database;

        if (databaseName) {
            const isExistDatabase = await this.hasDatabase(databaseName);

            if (!isExistDatabase) {
                return Promise.resolve();
            }
        } else {
            throw new CQError('Cannot clear database. There is no database !');
        }
    }

    getDatabases(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getSchemas(_database?: string): Promise<string[]> {
        throw new CQError(`Drop schema query is not supported...!`);
    }
}
