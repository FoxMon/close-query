import { DialectPlatform } from '../../dialect/DialectPlatform';
import { DefaultDataTypes } from '../../types/DefaultDataTypes';
import { Connector } from '../Connector';
import { MysqlConnectorOptions } from './MysqlConnectorOptions';

/**
 * `MysqlConnector.ts`
 *
 * `MySQL` DBMS와 통신을 하기 위한 MysqlConnector class 정의
 */
export class MysqlConnector implements Connector {
    mysql: unknown;

    options: MysqlConnectorOptions;

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

    connect(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    disconnect(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    loadConnectorDependencies(): void {
        try {
            const mysql = DialectPlatform.load('mysql');

            this.mysql = mysql;
        } catch (error) {
            throw new Error("Cannot connect MySQL. 'MysqlConnector.loadConnectorDependencies'");
        }
    }
}
