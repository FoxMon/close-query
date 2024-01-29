/* eslint-disable @typescript-eslint/no-explicit-any */

import { Manager } from '../../manager/Manager';
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
     * 새로운 Database를 생성하도록 한다.
     */
    createDatabase(database: string, ifNotExist?: boolean): Promise<void>;

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
}
