import { EntityManager } from '../manager/EntityManager';
import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';

/**
 * `TransactionCommitEvent.ts`
 */
export interface TransactionCommitEvent {
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
}
