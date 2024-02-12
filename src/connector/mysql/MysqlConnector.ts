/* eslint-disable no-control-regex */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DialectPlatform } from '../../dialect/DialectPlatform';
import { Manager } from '../../manager/Manager';
import { DefaultDataType } from '../../types/DefaultDataType';
import { Connector } from '../Connector';
import { MysqlConnectorOptions } from './MysqlConnectorOptions';
import { ConnectorNotInstalledError } from '../../error/ConnectorNotInstalledError';
import { CQError } from '../../error/CQError';
import { MysqlConnectorCredentialsOptions } from './MysqlConnectorCredentialsOptions';
import { ConnectorBuilder } from '../ConnectorBuilder';
import { QueryExecutor } from '../../query/executor/QueryExecutor';
import { Replication } from '../../types/Replication';
import { MySqlQueryExecutor } from './MySqlQueryExecutor';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { Table } from '../../schema/table/Table';
import { TableForeignKey } from '../../schema/table/TableForeignKey';
import { View } from '../../schema/view/View';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { ColumnDataStorage } from '../../storage/column/ColumnDataStorage';
import { TableColumn } from '../../schema/table/TableColumn';
import { CteCapabilities } from '../types/CteCapabilities';
import { ReturningType } from '../types/ReturningType';
import { CQUtil } from '../../utils/CQUtil';
import { ColumnType } from '../../types/column/ColumType';
import { VersionUtil } from '../../utils/VersionUtil';
import { DateUtil } from '../../utils/DateUtil';
import { MappedColumnTypes } from '../types/MappedColumnTypes';

/**
 * `MysqlConnector.ts`
 *
 * `MySQL` DBMS와 통신을 하기 위한 MysqlConnector class 정의
 */
export class MysqlConnector implements Connector {
    readonly '_instance' = Symbol.for('MysqlConnector');

    mysql: any;

    options: MysqlConnectorOptions;

    manager: Manager;

    version?: string;

    defaultDataTypes: DefaultDataType = {
        char: {
            length: 1,
        },
        varchar: {
            length: 255,
        },
        nvarchar: {
            length: 255,
        },
        'national varchar': {
            length: 255,
        },
        binary: {
            length: 1,
        },
        varbinary: {
            length: 255,
        },
        decimal: {
            precision: 10,
            scale: 0,
        },
        dec: {
            precision: 10,
            scale: 0,
        },
        numeric: {
            precision: 10,
            scale: 0,
        },
        fixed: {
            precision: 10,
            scale: 0,
        },
        float: {
            precision: 12,
        },
        double: {
            precision: 22,
        },
        time: {
            precision: 0,
        },
        datetime: {
            precision: 0,
        },
        timestamp: {
            precision: 0,
        },
        bit: {
            width: 1,
        },
        int: {
            width: 11,
        },
        integer: {
            width: 11,
        },
        tinyint: {
            width: 4,
        },
        smallint: {
            width: 6,
        },
        mediumint: {
            width: 9,
        },
        bigint: {
            width: 20,
        },
    };

    mappedDataTypes: MappedColumnTypes = {
        createDate: 'datetime',
        createDatePrecision: 6,
        createDateDefault: 'CURRENT_TIMESTAMP(6)',
        updateDate: 'datetime',
        updateDatePrecision: 6,
        updateDateDefault: 'CURRENT_TIMESTAMP(6)',
        deleteDate: 'datetime',
        deleteDatePrecision: 6,
        deleteDateNullable: true,
        version: 'int',
        treeLevel: 'int',
        migrationId: 'int',
        migrationName: 'varchar',
        migrationTimestamp: 'bigint',
        cacheId: 'int',
        cacheIdentifier: 'varchar',
        cacheTime: 'bigint',
        cacheDuration: 'int',
        cacheQuery: 'text',
        cacheResult: 'text',
        metadataType: 'varchar',
        metadataDatabase: 'varchar',
        metadataSchema: 'varchar',
        metadataTable: 'varchar',
        metadataName: 'varchar',
        metadataValue: 'text',
    };

    database?: string;

    /**
     * Replciation Mode가 아닌 경우에, 기본적으로 pool에 MySQL서버의 Cluster를 담도록 한다.
     *
     * @example
     *      mysql.createPool(config)
     */
    pool: any;

    /**
     * MySQL 서버가 여러대 존재할 경우, HOST는 여러대의 MySQL서버와 연결할 수 있는데,
     * 이 때 poolCluster를 활용하도록 한다.
     *
     * @example
     *      mysql.createPoolCluster(config)
     *
     *      poolCluster.add("SOURCE", config)
     *      poolCluster.add("REPLICA01", config)
     *      poolCluster.add("REPLICA02", config)
     */
    poolCluster: any;

    cteCapabilities: CteCapabilities = {
        enabled: false,
        requiresRecursiveHint: true,
    };

    schema?: string | undefined;

    isReplicated: boolean = false;

    maxAliasLength = 63;

    /**
     * MariaDB supports uuid type for version 10.7.0 and up
     */
    private uuidColumnTypeSuported = false;

    private readonly _isReturningSqlSupported: Record<ReturningType, boolean> = {
        delete: false,
        insert: false,
        update: false,
    };

    constructor(manager: Manager) {
        this.manager = manager;

        this.options = {
            ...manager.options,
        } as MysqlConnectorOptions;

        this.isReplicated = this.options.replication ? true : false;

        this.loadConnectorDependencies();
    }

    prepareHydratedValue(column: ColumnDataStorage) {
        const defaultValue = column.default;

        if (defaultValue === null) {
            return undefined;
        }

        if (
            (column.type === 'enum' ||
                column.type === 'simple-enum' ||
                typeof defaultValue === 'string') &&
            defaultValue !== undefined
        ) {
            return `'${defaultValue}'`;
        }

        if (column.type === 'set' && defaultValue !== undefined) {
            return `'${DateUtil.simpleArrayToString(defaultValue)}'`;
        }

        if (typeof defaultValue === 'number') {
            return `'${defaultValue.toFixed(column.scale)}'`;
        }

        if (typeof defaultValue === 'boolean') {
            return defaultValue ? '1' : '0';
        }

        if (typeof defaultValue === 'function') {
            const value = defaultValue();
            return this.normalizeDatetimeFunction(value);
        }

        if (defaultValue === undefined) {
            return undefined;
        }

        return `${defaultValue}`;
    }

    async connect(): Promise<void> {
        if (this.options.replication) {
            this.poolCluster = this.mysql.createPoolCluster(this.options.replication);

            this.options.replication.replicas.forEach((rep, idx) => {
                this.poolCluster.add(
                    `REPLICA${idx}`,
                    this.createConnectorOption(this.options, rep),
                );
            });

            this.poolCluster.add(
                'SOURCE',
                this.createConnectorOption(this.options, this.options.replication.source),
            );
        } else {
            this.pool = await this.createPool(
                this.createConnectorOption(this.options, this.options),
            );
        }

        /**
         * @TODO Query에 관련된 로직도 연결해야 한다...
         */
    }

    async disconnect(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    generateTableName(tableName: string, schema?: string, database?: string): string {
        const tableNames = [tableName];

        if (database) {
            tableNames.unshift(database);
        }

        if (schema) {
            tableNames.unshift(schema);
        }

        return tableNames.join('.');
    }

    loadConnectorDependencies(): void {
        const packageName: string = this.options.packageName ?? 'mysql';

        try {
            const mysql = DialectPlatform.load(packageName);

            this.mysql = mysql;

            if (!Object.keys(this.mysql).length) {
                throw new CQError(`'${packageName}' was is empty.`);
            }
        } catch (error) {
            throw new ConnectorNotInstalledError('MySQL', 'MySQL');
        }
    }

    createPool(options: any): Promise<any> {
        const pool = this.mysql.createPool(options);

        return new Promise<void>((resolve, reject) => {
            pool.getConnection((error: any, connection: any) => {
                if (error) {
                    return pool.end(() => reject(error));
                }

                connection.release();

                resolve(pool);
            });
        });
    }

    createConnectorOption(
        options: MysqlConnectorOptions,
        credentials: MysqlConnectorCredentialsOptions,
    ): Promise<any> {
        credentials = Object.assign(
            {},
            credentials,
            ConnectorBuilder.createConnectorOption(credentials),
        );

        const createdOptions = Object.assign(
            {},
            {
                charset: options.charset,
                timezone: options.timezone,
                connectTimeout: options.connectTimeout,
                insecureAuth: options.insecureAuth,
                supportBigNumbers:
                    options.supportBigNumbers !== undefined ? options.supportBigNumbers : true,
                bigNumberStrings:
                    options.bigNumberStrings !== undefined ? options.bigNumberStrings : true,
                dateStrings: options.dateStrings,
                debug: options.debug,
                trace: options.trace,
                multipleStatements: options.multipleStatements,
                flags: options.flags,
            },
            {
                host: credentials.host,
                user: credentials.user,
                password: credentials.password,
                database: credentials.database,
                port: credentials.port,
                ssl: options.ssl,
                socketPath: credentials.socketPath,
            },
            options.acquireTimeout === undefined ? {} : { acquireTimeout: options.acquireTimeout },
            { connectionLimit: options.poolSize },
        );

        return createdOptions;
    }

    createQueryExecutor(mode: Replication): QueryExecutor {
        return new MySqlQueryExecutor(this, mode);
    }

    queryAndParams(
        sql: string,
        params: ObjectIndexType,
        nativeParams: ObjectIndexType,
    ): [string, any[]] {
        const escapedParameters: any[] = Object.keys(nativeParams).map((key) => nativeParams[key]);

        if (!params || !Object.keys(params).length) {
            return [sql, escapedParameters];
        }

        sql = sql.replace(
            /:(\.\.\.)?([A-Za-z0-9_.]+)/g,
            (full, isArray: string, key: string): string => {
                if (!Object.prototype.hasOwnProperty.call(params, key)) {
                    return full;
                }

                const value: any = params[key];

                /**
                 * `? ? ? ? ?`
                 * 이러한 형태로 만들어야 하므로,,,
                 */
                if (isArray) {
                    return value
                        .map((v: any) => {
                            escapedParameters.push(v);
                            return '?';
                        })
                        .join(', ');
                }

                if (typeof value === 'function') {
                    return value();
                }

                escapedParameters.push(value);

                return '?';
            },
        );

        return [sql, escapedParameters];
    }

    buildTableName(tableName: string, _schema?: string, database?: string): string {
        const tablePath = [tableName];

        if (database) {
            tablePath.unshift(database);
        }

        return tablePath.join('.');
    }

    parseTableName(target: CQDataStorage | Table | View | TableForeignKey | string): {
        database?: string;
        schema?: string;
        tableName: string;
    } {
        const driverDatabase = this.database;
        const driverSchema = undefined;

        if (CheckerUtil.checkIsTable(target) || CheckerUtil.checkIsView(target)) {
            const parsed = this.parseTableName(target.name);

            return {
                database: target.database || parsed.database || driverDatabase,
                schema: target.schema || parsed.schema || driverSchema,
                tableName: parsed.tableName,
            };
        }

        if (CheckerUtil.checkIsTableForeignKey(target)) {
            const parsed = this.parseTableName(target.referencedTableName);

            return {
                database: target.referencedDatabase || parsed.database || driverDatabase,
                schema: target.referencedSchema || parsed.schema || driverSchema,
                tableName: parsed.tableName,
            };
        }

        if (CheckerUtil.checkIsCQDataStorage(target)) {
            return {
                database: target.database || driverDatabase,
                schema: target.schema || driverSchema,
                tableName: target.tableName,
            };
        }

        const parts = target.split('.');

        return {
            database: (parts.length > 1 ? parts[0] : undefined) || driverDatabase,
            schema: driverSchema,
            tableName: parts.length > 1 ? parts[1] : parts[0],
        };
    }

    createFullType(column: TableColumn): string {
        let type = column.type;

        if (this.getColumnLength(column)) {
            type += `(${this.getColumnLength(column)})`;
        } else if (column.width) {
            type += `(${column.width})`;
        } else if (
            column.precision !== null &&
            column.precision !== undefined &&
            column.scale !== null &&
            column.scale !== undefined
        ) {
            type += `(${column.precision},${column.scale})`;
        } else if (column.precision !== null && column.precision !== undefined) {
            type += `(${column.precision})`;
        }

        if (column.isArray) type += ' array';

        return type;
    }

    getColumnLength(column: ColumnDataStorage | TableColumn): string {
        if (column.length) {
            return column.length.toString();
        }

        if (column.generationStrategy === 'uuid' && !this.uuidColumnTypeSuported) {
            return '36';
        }

        switch (column.type) {
            case String:
            case 'varchar':
            case 'nvarchar':
            case 'national varchar':
                return '255';
            case 'varbinary':
                return '255';
            default:
                return '';
        }
    }

    escape(columnName: string): string {
        return '`' + columnName + '`';
    }

    escapeComment(comment?: string) {
        if (!comment) {
            return comment;
        }

        comment = comment.replace(/\u0000/g, '');

        return comment;
    }

    obtainMasterConnection(): Promise<any> {
        return new Promise<any>((ok, fail) => {
            if (this.poolCluster) {
                this.poolCluster.getConnection('MASTER', (err: any, dbConnection: any) => {
                    err ? fail(err) : ok(this.prepareDbConnection(dbConnection));
                });
            } else if (this.pool) {
                this.pool.getConnection((err: any, dbConnection: any) => {
                    err ? fail(err) : ok(this.prepareDbConnection(dbConnection));
                });
            } else {
                fail(new CQError(`Connection is not established with mysql database`));
            }
        });
    }

    obtainSlaveConnection(): Promise<any> {
        if (!this.poolCluster) return this.obtainMasterConnection();

        return new Promise<any>((ok, fail) => {
            this.poolCluster.getConnection('SLAVE*', (err: any, dbConnection: any) => {
                err ? fail(err) : ok(this.prepareDbConnection(dbConnection));
            });
        });
    }

    isReturningSqlSupported(returningType: ReturningType): boolean {
        return this._isReturningSqlSupported[returningType];
    }

    isUUIDGenerationSupported(): boolean {
        return false;
    }

    isFullTextColumnTypeSupported(): boolean {
        return true;
    }

    createParam(_parameterName: string, _index: number): string {
        return '?';
    }

    createGeneratedMap(dataStorage: CQDataStorage, insertResult: any, entityIndex: number) {
        if (!insertResult) {
            return undefined;
        }

        if (insertResult.insertId === undefined) {
            return Object.keys(insertResult).reduce((map, key) => {
                const column = dataStorage.findColumnWithDatabaseName(key);

                if (column) {
                    CQUtil.mergeDeep(map, column.createValueMap(insertResult[key]));
                }

                return map;
            }, {} as ObjectIndexType);
        }

        const generatedMap = dataStorage.generatedColumns.reduce((map, generatedColumn) => {
            let value: any;

            if (generatedColumn.generationStrategy === 'increment' && insertResult.insertId) {
                value = insertResult.insertId + entityIndex;
            }

            return CQUtil.mergeDeep(map, generatedColumn.createValueMap(value));
        }, {} as ObjectIndexType);

        return Object.keys(generatedMap).length > 0 ? generatedMap : undefined;
    }

    findChangedColumns(
        tableColumns: TableColumn[],
        columnMetadatas: ColumnDataStorage[],
    ): ColumnDataStorage[] {
        return columnMetadatas.filter((columnMetadata) => {
            const tableColumn = tableColumns.find((c) => c.name === columnMetadata.databaseName);

            if (!tableColumn) {
                return false;
            }

            const isColumnChanged =
                tableColumn.name !== columnMetadata.databaseName ||
                this.isColumnDataTypeChanged(tableColumn, columnMetadata) ||
                tableColumn.length !== this.getColumnLength(columnMetadata) ||
                tableColumn.width !== columnMetadata.width ||
                (columnMetadata.precision !== undefined &&
                    tableColumn.precision !== columnMetadata.precision) ||
                (columnMetadata.scale !== undefined &&
                    tableColumn.scale !== columnMetadata.scale) ||
                tableColumn.zerofill !== columnMetadata.zerofill ||
                tableColumn.unsigned !== columnMetadata.unsigned ||
                tableColumn.asExpression !== columnMetadata.asExpression ||
                tableColumn.generatedType !== columnMetadata.generatedType ||
                tableColumn.comment !== this.escapeComment(columnMetadata.comment) ||
                !this.compareDefaultValues(
                    this.normalizeDefault(columnMetadata),
                    tableColumn.default,
                ) ||
                (tableColumn.enum &&
                    columnMetadata.enum &&
                    !CQUtil.isArraysEqual(
                        tableColumn.enum,
                        columnMetadata.enum.map((val) => val + ''),
                    )) ||
                tableColumn.onUpdate !== this.normalizeDatetimeFunction(columnMetadata.onUpdate) ||
                tableColumn.primary !== columnMetadata.isPrimary ||
                !this.compareNullableValues(columnMetadata, tableColumn) ||
                tableColumn.unique !== this.normalizeIsUnique(columnMetadata) ||
                (columnMetadata.generationStrategy !== 'uuid' &&
                    tableColumn.isGenerated !== columnMetadata.isGenerated);

            return isColumnChanged;
        });
    }

    compareDefaultValues(
        columnMetadataValue: string | undefined,
        databaseValue: string | undefined,
    ): boolean {
        if (typeof columnMetadataValue === 'string' && typeof databaseValue === 'string') {
            columnMetadataValue = columnMetadataValue.replace(/^'+|'+$/g, '');
            databaseValue = databaseValue.replace(/^'+|'+$/g, '');
        }

        return columnMetadataValue === databaseValue;
    }

    compareNullableValues(columnMetadata: ColumnDataStorage, tableColumn: TableColumn): boolean {
        const isMariaDb = this.options.type === 'mariadb';
        if (isMariaDb && columnMetadata.generatedType) {
            return true;
        }

        return columnMetadata.isNullable === tableColumn.nullable;
    }

    prepareDbConnection(connection: any): any {
        const { logger } = this.manager;

        if (connection.listeners('error').length === 0) {
            connection.on('error', (error: any) =>
                logger.log('warn', `MySQL connection raised an error. ${error}`),
            );
        }

        return connection;
    }

    normalizeType(column: {
        type: ColumnType;
        length?: number | string;
        precision?: number | null;
        scale?: number;
    }): string {
        if (column.type === Number || column.type === 'integer') {
            return 'int';
        } else if (column.type === String) {
            return 'varchar';
        } else if (column.type === Date) {
            return 'datetime';
        } else if ((column.type as any) === Buffer) {
            return 'blob';
        } else if (column.type === Boolean) {
            return 'tinyint';
        } else if (column.type === 'uuid' && !this.uuidColumnTypeSuported) {
            return 'varchar';
        } else if (
            column.type === 'json' &&
            this.options.type === 'mariadb' &&
            !VersionUtil.isGreaterOrEqual(this.version ?? '0.0.0', '10.4.3')
        ) {
            return 'longtext';
        } else if (column.type === 'dec' || column.type === 'numeric' || column.type === 'fixed') {
            return 'decimal';
        } else if (column.type === 'bool' || column.type === 'boolean') {
            return 'tinyint';
        } else if (column.type === 'nvarchar') {
            return 'varchar';
        } else if (column.type === 'nchar' || column.type === 'national char') {
            return 'char';
        } else {
            return (column.type as string) || '';
        }
    }

    normalizeDefault(columnMetadata: ColumnDataStorage): string | undefined {
        const defaultValue = columnMetadata.default;

        if (defaultValue === null) {
            return undefined;
        }

        if (
            (columnMetadata.type === 'enum' || typeof defaultValue === 'string') &&
            defaultValue !== undefined
        ) {
            return `'${defaultValue}'`;
        }

        if (columnMetadata.type === 'set' && defaultValue !== undefined) {
            return `'${DateUtil.simpleArrayToString(defaultValue)}'`;
        }

        if (typeof defaultValue === 'number') {
            return `'${defaultValue.toFixed(columnMetadata.scale)}'`;
        }

        if (typeof defaultValue === 'boolean') {
            return defaultValue ? '1' : '0';
        }

        if (typeof defaultValue === 'function') {
            const value = defaultValue();

            return this.normalizeDatetimeFunction(value);
        }

        if (defaultValue === undefined) {
            return undefined;
        }

        return `${defaultValue}`;
    }

    normalizeDatetimeFunction(value?: string) {
        if (!value) {
            return value;
        }

        const isDatetimeFunction =
            value.toUpperCase().indexOf('CURRENT_TIMESTAMP') !== -1 ||
            value.toUpperCase().indexOf('NOW') !== -1;

        if (isDatetimeFunction) {
            const precision = value.match(/\(\d+\)/);

            if (this.options.type === 'mariadb') {
                return precision ? `CURRENT_TIMESTAMP${precision[0]}` : 'CURRENT_TIMESTAMP()';
            } else {
                return precision ? `CURRENT_TIMESTAMP${precision[0]}` : 'CURRENT_TIMESTAMP';
            }
        } else {
            return value;
        }
    }

    normalizeIsUnique(column: ColumnDataStorage): boolean {
        return column.dataStorage.indexes.some(
            (idx) => idx.unique && idx.columns.length === 1 && idx.columns[0] === column,
        );
    }

    isColumnDataTypeChanged(tableColumn: TableColumn, columnMetadata: ColumnDataStorage) {
        if (
            this.normalizeType(columnMetadata) === 'json' &&
            tableColumn.type.toLowerCase() === 'longtext'
        ) {
            return false;
        }

        return tableColumn.type !== this.normalizeType(columnMetadata);
    }
}
