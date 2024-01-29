import { EntityManager } from '../manager/EntityManager';
import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { CQDataStorage } from '../storage/CQDataStorage';

/**
 * `LoadEvent.ts`
 *
 * LoadEvent는 Database의 Entity가 load 됐을 때 이벤트를 수신할 수 있도록 한다.
 */
export interface LoadEvent<Entity> {
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
     * Entity를 load하도록 한다.
     */
    entity: Entity;

    /**
     * close-query의 DataStorage를 정의한다.
     */
    dataStorage: CQDataStorage;
}
