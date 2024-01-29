/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventBroadCaster } from '../../event/EventBroadCaster';
import { EntityManager } from '../../manager/EntityManager';
import { Manager } from '../../manager/Manager';
import { Table } from '../../schema/table/Table';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { Replication } from '../../types/Replication';
import { SQLMemory } from '../SQLMemory';
import { QueryResult } from './QueryResult';

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
    readonly manager: Manager;

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
     * QueryExecutor가 Entity event가 발생했을 때 사용되므로 필요한
     * 필드이다.
     */
    readonly eventBroadCaster: EventBroadCaster;

    /**
     * QueryExecutor에서 함께 동작하는 EntityManager이다.
     */
    readonly entityManager: EntityManager;

    /**
     * EventSubscriber 끼리 Data를 공유할 때 유용하게 사용 될 필드이다.
     * 임시로 Data를 저장할 때 사용하도록 한다.
     */
    data: ObjectIndexType;

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

    /**
     * 주어진 SQL Query를 실행하도록 한다.
     */
    query(
        query: string,
        params: any[] | undefined,
        useStructuredResult: true,
    ): Promise<QueryResult>;
    query(q: string, params?: any[]): Promise<any>;

    /**
     * 현재 Database에 연결된 모든 Table을 지우도록 한다.
     */
    clearDatabase(database?: string): Promise<void>;

    /**
     * 새로운 Database를 생성하도록 한다.
     */
    createDatabase(database: string, ifNotExist?: boolean): Promise<void>;

    /**
     * 사용 가능한 모든 Database의 이름을 가져오도록 한다.
     */
    getDatabases(): Promise<string[]>;

    /**
     * Database가 존재하는지 체크하도록 한다.
     */
    hasDatabase(database: string): Promise<boolean>;

    /**
     * Database를 drop 하도록 한다.
     */
    dropDatabase(database: string, ifExist?: boolean): Promise<void>;

    /**
     * 새로운 Schema를 생성하도록 한다.
     */
    createSchema(schemaPath: string, ifNotExist?: boolean): Promise<void>;

    /**
     * 모든 schema를 drop 한다.
     */
    dropSchema(schemaPath: string, ifExist?: boolean, isCascade?: boolean): Promise<void>;

    /**
     * 모든 사용가능한 Schema를 가져오도록 한다.
     * Database라는 Parameter가 전달된 경우 이에 해당하는 Schema만 반환한다.
     */
    getSchemas(database?: string): Promise<string[]>;

    /**
     * SQLMemory를 사용하도록 한다.
     */
    enableSqlMemory(): void;

    /**
     * SQLMemory를 비활성화 하도록 한다.
     * 사용하고자 한다면 `enableSqlMemory()` 함수를 호축하도록 한다.
     *
     * 이전에 Memorized된 것들은 전부 비워진다.
     */
    disableSqlMemory(): void;

    /**
     * Memorized된 SQL메모리를 flush all 하도록 한다.
     */
    clearSqlMemory(): void;

    /**
     * Memory에 존재하는 SQL에 대한 젇보들을 모두 가져오도록 한다.
     */
    getMemorySql(): SQLMemory;

    /**
     * 주어진 Database에서 Table을 반환하도록 한다.
     */
    getTable(tablePath: string): Promise<Table | undefined>;

    /**
     * `source-replica`를 반환하도록 한다.
     */
    getReplicationMode(): Replication;
}
