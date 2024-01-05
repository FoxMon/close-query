/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `MysqlConnectorCredentialsOptions.ts`
 *
 * MySQL에 연결 시, 필요한 Credential 정의
 *
 * @참고 https://github.com/mysqljs/mysql#connection-options
 */
export interface MysqlConnectorCredentialsOptions {
    /**
     * Database의 hostname 정의.
     * Default: localhost
     */
    readonly host?: string;

    /**
     * Database의 port 정의
     * Default: 3306
     */
    readonly port?: number;

    /**
     * Database 연결 시 어디서 connection을 수행할 것인지 정의.
     */
    readonly url?: string;

    /**
     * Database 연결 시 사용자가 지정한 user.
     */
    readonly user?: string;

    /**
     * Database 연결 시 사용자가 지정한 password.
     */
    readonly password?: string;

    /**
     * Database 연결 시 어떠한 Database와 연결할 것인지 정의.
     */
    readonly database?: string;

    /**
     * SSL profile의 이름을 포함한 string.
     * 혹은 SSL parameters Object
     */
    readonly ssl?: any;

    /**
     * Database의 socketPath.
     */
    readonly socketPath?: string;
}
