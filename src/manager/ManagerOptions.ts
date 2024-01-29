/* eslint-disable @typescript-eslint/no-explicit-any */

import { Naming } from '../naming/Naming';
import { DatabaseType } from '../types/DatabaseType';

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
}
