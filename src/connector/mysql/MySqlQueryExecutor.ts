/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReadStream } from 'fs';
import { V } from 'vitest/dist/reporters-qc5Smpt5';
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
import { TableCheck } from '../../schema/table/TableCheck';
import { TableColumn } from '../../schema/table/TableColumn';
import { TableExclusion } from '../../schema/table/TableExclusion';
import { TableForeignKey } from '../../schema/table/TableForeignKey';
import { TableIndex } from '../../schema/table/TableIndex';
import { TableUnique } from '../../schema/table/TableUnique';
import { View } from '../../schema/view/View';
import { Replication } from '../../types/Replication';
import { MysqlConnector } from './MysqlConnector';
import { TableType } from '../types/TableType';

/**
 * `MySqlQueryExecutor.ts`
 *
 * MySQL의 Query를 실행할 수 있도록 해주는 class를 정의한다.
 */
export class MySqlQueryExecutor extends SuperQueryExecutor implements QueryExecutor {
    readonly '_instance' = Symbol.for('MySqlQueryExecutor');

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

    loadTables(_tablePaths?: string[] | undefined): Promise<Table[]> {
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

    async loadViews(viewNames?: string[]): Promise<View[]> {
        const hasTable = await this.hasTable(this.getCQTableName());
        if (!hasTable) {
            return [];
        }

        if (!viewNames) {
            viewNames = [];
        }

        const currentDatabase = await this.getCurrentDatabase();
        const viewsCondition = viewNames
            .map((tableName) => {
                // eslint-disable-next-line prefer-const
                let { database, tableName: name } =
                    this.manager.connector.parseTableName(tableName);

                if (!database) {
                    database = currentDatabase;
                }

                return `(\`t\`.\`schema\` = '${database}' AND \`t\`.\`name\` = '${name}')`;
            })
            .join(' OR ');

        const query =
            `SELECT \`t\`.*, \`v\`.\`check_option\` FROM ${this.escapePath(
                this.getCQTableName(),
            )} \`t\` ` +
            `INNER JOIN \`information_schema\`.\`views\` \`v\` ON \`v\`.\`table_schema\` = \`t\`.\`schema\` AND \`v\`.\`table_name\` = \`t\`.\`name\` WHERE \`t\`.\`type\` = '${
                TableType.VIEW
            }' ${viewsCondition ? `AND (${viewsCondition})` : ''}`;
        const dbViews = await this.query(query);

        return dbViews.map((dbView: any) => {
            const view = new View();
            const db = dbView['schema'] === currentDatabase ? undefined : dbView['schema'];
            view.database = dbView['schema'];
            view.name = this.manager.connector.buildTableName(dbView['name'], undefined, db);
            view.expression = dbView['value'];

            return view;
        });
    }

    getDatabases(): Promise<string[]> {
        return Promise.resolve([]);
    }

    getSchemas(_database?: string): Promise<string[]> {
        throw new CQError(`Drop schema query is not supported...!`);
    }

    stream(
        query: string,
        params?: any[] | undefined,
        onEnd?: Function | undefined,
        onError?: Function | undefined,
    ): Promise<ReadStream> {
        if (this.isReleased) throw new QueryExecutorAlreadyReleasedError();

        return new Promise(async (resolve, fail) => {
            try {
                const databaseConnection = await this.initialize();

                this.manager.logger.logQuery(query, params, this);

                const databaseQuery = databaseConnection.query(query, params);

                if (onEnd) {
                    databaseQuery.on('end', onEnd);
                }

                if (onError) {
                    databaseQuery.on('error', onError);
                }

                resolve(databaseQuery.stream());
            } catch (err) {
                fail(err);
            }
        });
    }

    getView(viewPath: string): Promise<View | undefined> {
        throw new Error('Method not implemented.');
    }
    getViews(viewPaths?: string[] | undefined): Promise<View[]> {
        throw new Error('Method not implemented.');
    }
    startTransaction(database?: string | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }
    commitTransaction(): Promise<V> {
        throw new Error('Method not implemented.');
    }
    rollbackTransaction(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getCurrentDatabase(): Promise<string | undefined> {
        throw new Error('Method not implemented.');
    }
    hasSchema(schema: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    getCurrentSchema(): Promise<string | undefined> {
        throw new Error('Method not implemented.');
    }
    hasTable(table: string | Table): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    hasColumn(table: string | Table, columnName: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    createTable(
        table: Table,
        ifNotExist?: boolean | undefined,
        createForeignKeys?: boolean | undefined,
        createIndices?: boolean | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropTable(
        table: string | Table,
        ifExist?: boolean | undefined,
        dropForeignKeys?: boolean | undefined,
        dropIndices?: boolean | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createView(
        view: View,
        syncWithMetadata?: boolean | undefined,
        oldView?: View | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropView(view: string | View): Promise<void> {
        throw new Error('Method not implemented.');
    }
    renameTable(oldTableOrName: string | Table, newTableName: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    addColumn(table: string | Table, column: TableColumn): Promise<void> {
        throw new Error('Method not implemented.');
    }
    addColumns(table: string | Table, columns: TableColumn[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    renameColumn(
        table: string | Table,
        oldColumnOrName: string | TableColumn,
        newColumnOrName: string | TableColumn,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    changeColumn(
        table: string | Table,
        oldColumn: string | TableColumn,
        newColumn: TableColumn,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    changeColumns(
        table: string | Table,
        changedColumns: { oldColumn: TableColumn; newColumn: TableColumn }[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropColumn(table: string | Table, column: string | TableColumn): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropColumns(table: string | Table, columns: string[] | TableColumn[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createPrimaryKey(
        table: string | Table,
        columnNames: string[],
        constraintName?: string | undefined,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    updatePrimaryKeys(table: string | Table, columns: TableColumn[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropPrimaryKey(table: string | Table, constraintName?: string | undefined): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createUniqueConstraint(table: string | Table, uniqueConstraint: TableUnique): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createUniqueConstraints(
        table: string | Table,
        uniqueConstraints: TableUnique[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropUniqueConstraint(table: string | Table, uniqueOrName: string | TableUnique): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropUniqueConstraints(table: string | Table, uniqueConstraints: TableUnique[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createCheckConstraint(table: string | Table, checkConstraint: TableCheck): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createCheckConstraints(table: string | Table, checkConstraints: TableCheck[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropCheckConstraint(table: string | Table, checkOrName: string | TableCheck): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropCheckConstraints(table: string | Table, checkConstraints: TableCheck[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createExclusionConstraint(
        table: string | Table,
        exclusionConstraint: TableExclusion,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createExclusionConstraints(
        table: string | Table,
        exclusionConstraints: TableExclusion[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropExclusionConstraint(
        table: string | Table,
        exclusionOrName: string | TableExclusion,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropExclusionConstraints(
        table: string | Table,
        exclusionConstraints: TableExclusion[],
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createForeignKey(table: string | Table, foreignKey: TableForeignKey): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createForeignKeys(table: string | Table, foreignKeys: TableForeignKey[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropForeignKey(
        table: string | Table,
        foreignKeyOrName: string | TableForeignKey,
    ): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropForeignKeys(table: string | Table, foreignKeys: TableForeignKey[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createIndex(table: string | Table, index: TableIndex): Promise<void> {
        throw new Error('Method not implemented.');
    }
    createIndexes(table: string | Table, indexes: TableIndex[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropIndex(table: string | Table, index: string | TableIndex): Promise<void> {
        throw new Error('Method not implemented.');
    }
    dropIndices(table: string | Table, indices: TableIndex[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
    clearTable(tableName: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    escapePath(target: Table | View | string): string {
        const { database, tableName } = this.manager.connector.parseTableName(target);

        if (database && database !== this.manager.connector.database) {
            return `\`${database}\`.\`${tableName}\``;
        }

        return `\`${tableName}\``;
    }
}
