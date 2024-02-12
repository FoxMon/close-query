/* eslint-disable @typescript-eslint/no-explicit-any */

import { QueryResultCache } from '../cache/QueryResultCache';
import { Logger } from '../logger/Logger';
import { LoggerOption } from '../logger/LoggerOption';
import { Naming } from '../naming/Naming';
import { DatabaseType } from '../types/DatabaseType';
import { Manager } from './Manager';

/**
 * `ManagerOptions.ts`
 *
 * DatabaseManager는 모든 Database의 Type을 갖고 있다.
 * Manager의 Options에 대한 설정 정의.
 */
export interface ManagerOptions {
    /**
     * DBMS의 type들 정의.
     * 일반적으로 type이라고 부르도록 한다.
     */
    readonly type: DatabaseType;

    /**
     * Model에 Type의 name을 설정할 것인지?
     */
    readonly typename?: string;

    /**
     * Application을 실행할 당시 Database의 schema가 자동으로 생성되게 할 것인지에 대한 Flag 설정.
     * Development 환경에서는 디버깅에 유용하게 사용될 테지만,
     * Production 환경에서는 주의하여 사용할 것을 권장.
     */
    readonly synchronize?: boolean;

    /**
     * Database 연결 시 자동으로 schema를 Drop 할 것인지에 대한 Flag 설정.
     * Development 환경에서는 디버깅에 유용할 수 있겠지만,
     * Production 환경에서는 주의하여 사용할 것을 권장.
     */
    readonly dropSchema?: boolean;

    /**
     * MySQL의 Table이나 Column의 네이밍 전략을 어떻게 지정할 것인지 판단하도록 한다.
     *
     * Default: camelCase
     */
    readonly naming?: Naming;

    /**
     * 최대 cluster의 갯수를 몇개로 제한할 것인지 판단하도록 한다.
     */
    readonly poolSize?: number;

    /**
     * `Close-Query`에서 관리하는 Table의 일름이다.
     * string 형태로 관리하도록 한다.
     */
    readonly storageTableName?: string;

    /**
     * Query를 불러올 때 어떠한 전략으로 불러올 것인지 명시하도록 한다.
     * Default:  join
     */
    readonly relationStrategy?: 'join' | 'query';

    /**
     * Query를 수행하기까지 최대 시간을 ms 단위로 설정하도록 한다.
     */
    readonly maxQueryExecutionTime?: number;

    /**
     * 새로운 Entity를 생성할 때 사용하는 필드이다.
     * `true` 인 경우 Constructor를 Skip한다.
     */
    readonly entitySkipConstructor?: boolean;

    /**
     * Logger instance used to log query and events in the ORM
     */
    readonly logger?: 'advanced-console' | 'simple-console' | 'file' | 'debug' | Logger;

    /**
     * Logger option
     */
    readonly logging?: LoggerOption;

    /**
     * Isolation where 절을 자동으로 허용할 것인지에 대한 필드이다.
     */
    readonly isolateWhereStatements?: boolean;

    /**
     * Cache otpion을 설정하도록 한다.
     */
    readonly cache?:
        | boolean
        | {
              /**
               * Cache의 Type.
               *
               * - `database` DB의 Table에 나눠서 저장하도록 한다.
               * - `redis` Redis 내부에 저장하도록 한다.
               */
              readonly type?: 'database' | 'redis' | 'ioredis' | 'ioredis/cluster';

              /**
               * Factory function.
               */
              readonly provider?: (manager: Manager) => QueryResultCache;

              /**
               * `database`로 설정한 경우 사용하도록 한다.
               */
              readonly tableName?: string;

              /**
               * `redis`로 설정한 경우 그에 따른 Option을 설정하도록 한다.
               */
              readonly options?: any;

              /**
               * If set to true then queries (using find methods and QueryBuilder's methods) will always be cached.
               */
              readonly alwaysEnabled?: boolean;

              /**
               * Cache expire time을 지정하도록 한다.
               */
              readonly duration?: number;

              /**
               * Cache 에러가 발생한 경우 무시할 것인지 판단하도록 한다.
               */
              readonly ignoreErrors?: boolean;
          };
}
