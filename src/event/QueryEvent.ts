/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityManager } from '../manager/EntityManager';
import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';

/**
 * `QueryEvent.ts`
 */
export interface QueryEvent<_Entity> {
    /**
     * Database에 connect할 경우 사용되는 Manager.
     */
    manager: Manager;

    /**
     * Event를 받았을 때 실행할 QueryExecutor.
     * 모든 Entity는 QeuryExecutor를 통해서 transaction을 수행한다.
     */
    queryExecutor: QueryExecutor;

    /**
     * Event transaction시 사용한다.
     * 모든 Entity는 EntityManager를 통해서 transaction을 수행한다.
     */
    entityManager: EntityManager;

    /**
     * 실행할 query에 대한 정보를 담도록 하다..
     */
    query: string;

    /**
     * Query에 사용될 parameter를 정의한다.
     */
    params?: any[];
}

export interface AfterQueryEvent<Entity> extends QueryEvent<Entity> {
    /**
     * Query가 성공했는지 나타내도록 한다.
     */
    success: boolean;

    /**
     * Query가 실행되기까지 걸린 시간을 표현한다.
     */
    executionTime?: number;

    /**
     * Query의 실행 결과를 나타내도록 한다.
     */
    rawResults?: any;

    /**
     * Query가 실패했을 경우 Error 담도록 한다.
     */
    error?: any;
}
