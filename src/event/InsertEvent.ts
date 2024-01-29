import { EntityManager } from '../manager/EntityManager';
import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { CQDataStorage } from '../storage/CQDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';

/**
 * `InsertEvent.ts`
 */
export interface InsertEvent<Entity> {
    /**
     * Connection used in the event.
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
     * Insert 이벤트.
     */
    entity: Entity;

    /**
     * Insert된 Entity의 ID.
     */
    entityId?: ObjectIndexType;

    /**
     * close-query의 DataStorage를 정의한다.
     */
    dataStorage: CQDataStorage;
}
