/* eslint-disable @typescript-eslint/no-explicit-any */
import { CQError } from '../../error/CQError';
import { QueryExecutorAlreadyReleasedError } from '../../error/QueryExecutorAlreadyReleasedError';
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

    eventBroadCaster: EventBroadCaster;

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
            const result = new EventResult();

            try {
                const dbConnection = await this.initialize();

                /**
                 * @TODO 뭔가 해야함
                 */

                const queryResult = new QueryResult();
            } catch (error) {
                reject(error);
            } finally {
                /**
                 * @TODO 뭔가 해야함
                 */
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

        return this.databaseConnectorPromise;
    }

    release(): Promise<void> {
        this.isReleased = true;

        if (this.databaseConnector) {
            this.databaseConnector.release();
        }

        return Promise.resolve();
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
}
