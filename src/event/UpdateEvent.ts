import { EntityManager } from '../manager/EntityManager';
import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { CQDataStorage } from '../storage/CQDataStorage';
import { RelationDataStorage } from '../storage/RelationDataStorage';
import { ColumnDataStorage } from '../storage/column/ColumnDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';

/**
 * `UpdateEvent.ts`
 */
export interface UpdateEvent<Entity> {
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
     * Updating entity.
     */
    entity: ObjectIndexType | undefined;

    /**
     * close-query의 DataStorage를 정의한다.
     */
    dataStorage: CQDataStorage;

    /**
     * Update 이벤트.
     */
    databaseEntity: Entity;

    /**
     * Update된 Column에 대한 Data이다.
     */
    updatedColumns: ColumnDataStorage[];

    /**
     * Update의 영향을 받은 Data이다.
     */
    updatedRelations: RelationDataStorage[];
}
