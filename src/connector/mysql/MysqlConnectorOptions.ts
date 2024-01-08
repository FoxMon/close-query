/* eslint-disable @typescript-eslint/no-explicit-any */

import { MysqlConnectorCredentialsOptions } from './MysqlConnectorCredentialsOptions';
import { ManagerOptions } from '../../manager/ManagerOptions';
import { Replication } from '../../types/Replication';

/**
 * `MysqlConnectorOptions.ts`
 *
 * MySQL에서 connection시 필요한 option들 정의.
 *
 * @참고 https://github.com/mysqljs/mysql#connection-options
 * @참고 https://github.com/mysqljs/mysql
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
     * MySQL 연결 시, 오래된 auth의 경우 물어보도록 허용한다.
     *
     * Default: false
     */
    readonly insecureAuth?: boolean;

    /**
     * BIGINT를 사용할지 결정하도록 한다.
     *
     * Default: false
     */
    readonly supportBigNumbers?: boolean;

    /**
     * Default: false
     */
    readonly bigNumberStrings?: boolean;

    /**
     * Date에 해당하는 type들을 강제하기로 한다.
     *
     * Default: false
     */
    readonly dateStrings?: boolean;

    /**
     * MySQL에서 multiple statements per query를 허용하도록 한다.
     * SQL injection attack에 취약하므로 사용하는데 주의해야 한다.
     *
     * Default: false
     */
    readonly multipleStatements?: boolean;

    /**
     * Connection flag에 대한 string 정의한다.
     *
     * @참고 https://github.com/mysqljs/mysql?tab=readme-ov-file#connection-flags
     */
    readonly flags?: string[];

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

    /**
     * Connection acquisition 시간.
     *
     * Default: 10000
     */
    readonly acquireTimeout?: number;

    /**
     * MySQL replication을 셋팅하도록 한다.
     * Replication은 1개 이상의 replica 저장소가 소스 저장소와의 동기화를 자동으로 유지하는 것을 의미한다.
     * `source-replica` 관계를 유지하면서 데이터를 자동으로 동기화 한다.
     *
     * @참고 https://github.com/mysqljs/mysql?tab=readme-ov-file#poolcluster
     */
    readonly replication?: {
        /**
         * Database의 원래 데이터를 가지고 있는 원본 저장소를 의미한다.
         * source에 있는 데이터를 replica로 복제한다.
         */
        readonly source: MysqlConnectorCredentialsOptions;

        /**
         * Replica 서버에서 리스트를 읽어올 때 사용하낟.
         */
        readonly replicas: MysqlConnectorCredentialsOptions[];

        /**
         * Connection이 실패했을 때, 연결 시 자동으로
         * 재연결 시도를 하도록 설정하는 Flag이다.
         *
         * Default: true
         */
        readonly retry?: boolean;

        /**
         * Connection이 실패할 때, Error의 Count를 증가시키는데,
         * 해당 필드의 값보다 커지면 삭제하도록 한다.
         */
        readonly removeErrorCount?: number;

        /**
         * Connection이 실패하면 밀리세컨드 단위로 언제 다시 연결을 시도할지
         * 판단하는 필드이다.
         */
        readonly restoreTimeout?: number;

        /**
         * `replica`를 선택할 때, 어떠한 알고리즘을 적용하여 선택할 것인지 판단한다.
         *
         * RR       : Round-Robin을 선택하여 사용하도록 한다.
         * RANDOM   : Random 함수를 이용하여 선택한다.
         * ORDER    : 순서대로 선택하도록 한다.
         */
        readonly selector?: 'RR' | 'RANDOM' | 'ORDER';

        /**
         * Connection pool을 생성할 때 Query `SELECT` 명령어를 어디서 사용할 것인지 판단한다.
         *
         * Default: replica
         */
        readonly defaultMode?: Replication;
    };
}
