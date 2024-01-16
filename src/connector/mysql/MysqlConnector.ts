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

/**
 * `MysqlConnector.ts`
 *
 * `MySQL` DBMS와 통신을 하기 위한 MysqlConnector class 정의
 */
export class MysqlConnector implements Connector {
    readonly '_instance' = Symbol.for('MysqlConnector');

    mysql: any;

    options: MysqlConnectorOptions;

    connector: Manager;

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

    constructor(connector: Manager) {
        this.connector = connector;

        this.loadConnectorDependencies();
    }

    async connect(): Promise<void> {
        if (this.options.replication) {
            this.poolCluster = this.mysql.createPoolCluster(this.options.replication);

            this.options.replication.replicas.forEach((rep, idx) => {
                this.poolCluster.add(`REPLICA${idx}`);

                this.createConnectorOption(this.options, rep);
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
}
