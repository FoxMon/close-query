/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InsertEvent } from './InsertEvent';
import { LoadEvent } from './LoadEvent';
import { AfterQueryEvent, QueryEvent } from './QueryEvent';
import { RemoveEvent } from './RemoveEvent';
import { TransactionCommitEvent } from './TransactionCommitEvent';
import { TransactionRollbackEvent } from './TransactionRollbackEvent';
import { TransactionStartEvent } from './TransactionStartEvent';
import { UpdateEvent } from './UpdateEvent';

/**
 * `EventSubscriber.ts`
 *
 * EventSubscriber interface 정의
 */
export interface EventSubscriber<Entity = any> {
    /**
     * Listen하고 있는 class를 반환하도록 한다.
     * 해당 함수가 호출이 되면 구독자는 모든 event를 받게 된다.
     */
    listenTo?(): Function | string;

    /**
     * Database의 Entity가 Load된 이후에 발생한다.
     */
    afterLoad?(entity: Entity, event?: LoadEvent<Entity>): Promise<any> | void;

    /**
     * Query가 실행되기 이전에 발생한다.
     */
    beforeQuery?(event: QueryEvent<Entity>): Promise<any> | void;

    /**
     * Query가 실행된 이후에 발생한다.
     */
    afterQuery?(event: AfterQueryEvent<Entity>): Promise<any> | void;

    /**
     * Query의 Insert가 실행되기 이전에 발생한다.
     */
    beforeInsert?(event: InsertEvent<Entity>): Promise<any> | void;

    /**
     * Query의 Insert가 실행된 이후에 발생한다.
     */
    afterInsert?(event: InsertEvent<Entity>): Promise<any> | void;

    /**
     * Update되기 이전에 발생한다.
     */
    beforeUpdate?(event: UpdateEvent<Entity>): Promise<any> | void;

    /**
     * Update된 이후에 발생한다.
     */
    afterUpdate?(event: UpdateEvent<Entity>): Promise<any> | void;

    /**
     * Database가 remove되기 이전에 발생한다.
     */
    beforeRemove?(event: RemoveEvent<Entity>): Promise<any> | void;

    /**
     * Database가 remove된 이후에 발생한다.
     */
    afterRemove?(event: RemoveEvent<Entity>): Promise<any> | void;

    /**
     * Database가 soft remove되기 이전에 발생한다.
     */
    beforeSoftRemove?(event: RemoveEvent<Entity>): Promise<any> | void;

    /**
     * Database가 soft remove된 이후에 발생한다.
     */
    afterSoftRemove?(event: RemoveEvent<Entity>): Promise<any> | void;

    /**
     * Database가 recover되기 이전에 발생한다.
     */
    beforeRecover?(event: RemoveEvent<Entity>): Promise<any> | void;

    /**
     * Database가 recover된 이후에 발생한다.
     */
    afterRecover?(event: RemoveEvent<Entity>): Promise<any> | void;

    /**
     * Transaction이 시작되기 이전에 발생한다.
     */
    beforeTransactionStart?(event: TransactionStartEvent): Promise<any> | void;

    /**
     * Transaction이 시작된 이후에 발생한다.
     */
    afterTransactionStart?(event: TransactionStartEvent): Promise<any> | void;

    /**
     * Transaction이 commit되기 이전에 발생한다.
     */
    beforeTransactionCommit?(event: TransactionCommitEvent): Promise<any> | void;

    /**
     * Transaction이 commit된 이후에 발생한다.
     */
    afterTransactionCommit?(event: TransactionCommitEvent): Promise<any> | void;

    /**
     * Transaction rollback이 발생하기 이전에 호출된다.
     */
    beforeTransactionRollback?(event: TransactionRollbackEvent): Promise<any> | void;

    /**
     * Transaction rollback이 발생한 이후에 호출된다.
     */
    afterTransactionRollback?(event: TransactionRollbackEvent): Promise<any> | void;
}
