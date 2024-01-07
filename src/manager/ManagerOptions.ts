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

    readonly naming?: Naming;
}
