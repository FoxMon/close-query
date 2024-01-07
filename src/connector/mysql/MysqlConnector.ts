/* eslint-disable @typescript-eslint/no-explicit-any */

import { DialectPlatform } from '../../dialect/DialectPlatform';
import { Manager } from '../../manager/Manager';
import { DefaultDataTypes } from '../../types/DefaultDataTypes';
import { Connector } from '../Connector';
import { MysqlConnectorOptions } from './MysqlConnectorOptions';
import { ConnectorNotInstalledError } from '../../error/ConnectorNotInstalledError';
import { CQError } from '../../error/CQError';

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

    defaultDataTypes: DefaultDataTypes = {
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

    pool: any;

    constructor(connector: Manager) {
        this.connector = connector;

        this.loadConnectorDependencies();
    }

    async connect(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async disconnect(): Promise<void> {
        throw new Error('Method not implemented.');
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
}
