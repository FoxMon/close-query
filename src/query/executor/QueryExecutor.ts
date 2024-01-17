/* eslint-disable @typescript-eslint/no-explicit-any */

import { Manager } from '../../manager/Manager';

/**
 * `QueryExecutor.ts`
 *
 * Database에 있는 정보를 토대로 query를 실행할 수 있도록 작성한다.
 */
export interface QueryExecutor {
    /**
     * 해당 QueryExecutor가 query작업을 수행할
     * Database의 정보를 담고 있다.
     */
    readonly connector: Manager;

    /**
     * QueryExecutor가 한 번 released 된 상태라면
     * 더 이상 query를 수행할 수 없게 된다.
     */
    readonly isReleased: boolean;

    /**
     * Transaction이 수행 중인지 확인하는 필드이다.
     */
    readonly isTransaction: boolean;

    /**
     * 사용하고자 하는 Database와 연결하는 작업을 수행하도록 한다.
     * 연결된 Database의 정보를 반환하도록 한다.
     */
    initialize(): Promise<any>;

    /**
     * Database와 연결된 것을 `release` 시키도록 한다.
     * 한 번 released되고 나면 더 이상 query 작업을 수행할 수 없다.
     */
    release(): Promise<void>;
}
