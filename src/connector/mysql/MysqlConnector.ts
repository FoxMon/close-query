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

    /**
     * MariaDB supports uuid type for version 10.7.0 and up
     */
    private uuidColumnTypeSuported = false;

    constructor(manager: Manager) {
        this.manager = manager;

        this.options = {
            ...manager.options,
        } as MysqlConnectorOptions;

        this.loadConnectorDependencies();
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
}
