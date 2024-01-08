/* eslint-disable @typescript-eslint/no-explicit-any */

import { Manager } from '../../manager/Manager';
import { Replication } from '../../types/Replication';

/**
 * `SuperQueryExecutor.ts`
 *
 * Query를 실행시키는 class의 추상화.
 */
export abstract class SuperQueryExecutor {
    readonly 'instance' = Symbol.for('SuperQueryExecutor');

    manager: Manager;

    isTransaction: boolean = false;

    isReleased: boolean = false;

    databaseConnector: any;

    replicationMode: Replication;

    /**
     * 주어진 `QUERY`를 실행하는 함수를 추상화 한다.
     */
    abstract query(query: string, params?: any[], useStructuredResult?: boolean): Promise<any>;
}
