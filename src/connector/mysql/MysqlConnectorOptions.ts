/* eslint-disable @typescript-eslint/no-explicit-any */

import { MysqlConnectorCredentialsOptions } from './MysqlConnectorCredentialsOptions';
import { ManagerOptions } from '../../manager/ManagerOptions';

/**
 * `MysqlConnectorOptions.ts`
 *
 * MySQL에서 connection시 필요한 option들 정의.
 *
 * @참고 https://github.com/mysqljs/mysql#connection-options
 */
export interface MysqlConnectorOptions extends MysqlConnectorCredentialsOptions, ManagerOptions {
    /**
     * Database의 Type을 정의
     * mysql 혹은 mariadb
     */
    readonly type: 'mysql' | 'mariadb';

    /**
     * DBMS의 객체
     * require('mysql') 이거나, require('mysql2') 이다.
     */
    readonly connector?: any;

    /**
     * 연결을 위한 charset 정의.
     * 만약  SQL-level charset이라면 `utf8mb4` 인데, charset의 Default collation은 `UTF8_GENERAL_CI`
     * Default: `UTF8_GENERAL_CI`
     */
    readonly charset?: string;

    /**
     * MySQL에 대한 package name 정의.
     */
    readonly packageName?: 'mysql' | 'mysql2';

    /**
     * MySQL 서버에서의 timezone 정의.
     */
    readonly timezone?: string;

    /**
     * Timeout이 발생하기 전 Milliseconds 기준으로 MySQL 서버에 연결하기 까지의 시간.
     * Default: 10000 (10초)
     */
    readonly connectTimeout?: number;

    /**
     * Error Stack traces flag.
     * Default: true
     */
    readonly trace?: boolean;

    /**
     * Protocol details 출력. `true/false`로 설정하거나,
     * Array<string> 형태로 packet type names를 지정할 수 있다.
     */
    readonly debug?: boolean | string[];
}
