/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { VitestRunMode } from 'vitest';
import { EventBroadCaster } from '../../event/EventBroadCaster';
import { EntityManager } from '../../manager/EntityManager';
import { Manager } from '../../manager/Manager';
import { Table } from '../../schema/table/Table';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { Replication } from '../../types/Replication';
import { SQLMemory } from '../SQLMemory';
import { QueryResult } from './QueryResult';
import { ReadStream } from 'fs';
import { View } from '../../schema/view/View';
import { TableIndex } from '../../schema/table/TableIndex';
import { TableForeignKey } from '../../schema/table/TableForeignKey';
import { TableExclusion } from '../../schema/table/TableExclusion';
import { TableUnique } from '../../schema/table/TableUnique';
import { TableColumn } from '../../schema/table/TableColumn';
import { TableCheck } from '../../schema/table/TableCheck';

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
     * Raw data stream을 반환하도록 한다.
     */
    stream(
        query: string,
        params?: any[],
        onEnd?: Function,
        onError?: Function,
    ): Promise<ReadStream>;

    /**
     * Database에 있는 View를 가져오도록 한다.
     */
    getView(viewPath: string): Promise<View | undefined>;

    /**
     * Database에 있는 모든 View들을 가져오도록 한다.
     */
    getViews(viewPaths?: string[]): Promise<View[]>;

    /**
     * 현재 Database에 연결된 모든 Table을 지우도록 한다.
     */
    clearDatabase(database?: string): Promise<void>;

    /**
     * Transaction을 시작한다.
     */
    startTransaction(database?: string): Promise<void>;

    /**
     * Transaction을 Commit한다.
     * 만약 transaction이 시작되지 않았다면 Error가 던져지도록 한다.
     */
    commitTransaction(): Promise<VitestRunMode>;

    /**
     * Rollback transaction을 수행한다.
     * 만약 transaction이 시작되지 않았다면 Error가 던져지도록 한다.
     */
    rollbackTransaction(): Promise<void>;

    /**
     * 새로운 Database를 생성하도록 한다.
     */
    createDatabase(database: string, ifNotExist?: boolean): Promise<void>;

    /**
     * 현재 사용하고 있는 Database를 가져오도록 한다.
     */
    getCurrentDatabase(): Promise<string | undefined>;

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
     * Schema를 가지고 있는지 체크하도록 한다.
     */
    hasSchema(schema: string): Promise<boolean>;

    /**
     * 현재 Database에서 사용하고 있는 schema를 가져오도록 한다.
     */
    getCurrentSchema(): Promise<string | undefined>;

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
     * Table을 가지고 있는지 체크하도록 한다.
     */
    hasTable(table: Table | string): Promise<boolean>;

    /**
     * 주어진 Database에서 Table을 반환하도록 한다.
     */
    getTable(tablePath: string): Promise<Table | undefined>;

    /**
     * `source-replica`를 반환하도록 한다.
     */
    getReplicationMode(): Replication;

    /**
     * Table에 Column이 있는지 체크하도록 한다.
     */
    hasColumn(table: Table | string, columnName: string): Promise<boolean>;

    /**
     * Table을 생성하도록 한다.
     */
    createTable(
        table: Table,
        ifNotExist?: boolean,
        createForeignKeys?: boolean,
        createIndices?: boolean,
    ): Promise<void>;

    /**
     * Drop table
     */
    dropTable(
        table: Table | string,
        ifExist?: boolean,
        dropForeignKeys?: boolean,
        dropIndices?: boolean,
    ): Promise<void>;

    /**
     * View를 생성하도록 한다.
     */
    createView(view: View, syncWithMetadata?: boolean, oldView?: View): Promise<void>;

    /**
     * Drops a view
     */
    dropView(view: View | string): Promise<void>;

    /**
     * Table의 이름을 재지정 하도록 한다.
     */
    renameTable(oldTableOrName: Table | string, newTableName: string): Promise<void>;

    /**
     * Column을 추가하도록 한다.
     */
    addColumn(table: Table | string, column: TableColumn): Promise<void>;

    /**
     * Column들을 추가하도록 한다.
     */
    addColumns(table: Table | string, columns: TableColumn[]): Promise<void>;

    /**
     * Column의 이름을 재지정 하도록 한다.
     */
    renameColumn(
        table: Table | string,
        oldColumnOrName: TableColumn | string,
        newColumnOrName: TableColumn | string,
    ): Promise<void>;

    /**
     * Table에서 Column을 변경하도록 한다.
     */
    changeColumn(
        table: Table | string,
        oldColumn: TableColumn | string,
        newColumn: TableColumn,
    ): Promise<void>;

    /**
     * Table에서 Column들을 변경하도록 한다.
     */
    changeColumns(
        table: Table | string,
        changedColumns: { oldColumn: TableColumn; newColumn: TableColumn }[],
    ): Promise<void>;

    /**
     * Drop column
     */
    dropColumn(table: Table | string, column: TableColumn | string): Promise<void>;

    /**
     * Drop columns
     */
    dropColumns(table: Table | string, columns: TableColumn[] | string[]): Promise<void>;

    /**
     * PK를 생성하도록 한다.
     */
    createPrimaryKey(
        table: Table | string,
        columnNames: string[],
        constraintName?: string,
    ): Promise<void>;

    /**
     * PK를 수정하도록 한다.
     */
    updatePrimaryKeys(table: Table | string, columns: TableColumn[]): Promise<void>;

    /**
     * PK를 제거하도록 한다.
     */
    dropPrimaryKey(table: Table | string, constraintName?: string): Promise<void>;

    /**
     * Unique 제약조건을 설정하도록 한다.
     */
    createUniqueConstraint(table: Table | string, uniqueConstraint: TableUnique): Promise<void>;

    /**
     * Unique 제약조건들을 설정하도록 한다.
     */
    createUniqueConstraints(table: Table | string, uniqueConstraints: TableUnique[]): Promise<void>;

    /**
     * Unique 제약조건을 제거하도록 한다.
     */
    dropUniqueConstraint(table: Table | string, uniqueOrName: TableUnique | string): Promise<void>;

    /**
     * Unique 제약조건들을 제거하도록 한다.
     */
    dropUniqueConstraints(table: Table | string, uniqueConstraints: TableUnique[]): Promise<void>;

    /**
     * Check제약조건을 생성한다.
     */
    createCheckConstraint(table: Table | string, checkConstraint: TableCheck): Promise<void>;

    /**
     * 새로운 Check 제약조건들을 생성한다.
     */
    createCheckConstraints(table: Table | string, checkConstraints: TableCheck[]): Promise<void>;

    /**
     * Check제약조건을 지운다.
     */
    dropCheckConstraint(table: Table | string, checkOrName: TableCheck | string): Promise<void>;

    /**
     * Check제약조건들을 지우도록 한다.
     */
    dropCheckConstraints(table: Table | string, checkConstraints: TableCheck[]): Promise<void>;

    /**
     * Creates a new exclusion constraint.
     */
    createExclusionConstraint(
        table: Table | string,
        exclusionConstraint: TableExclusion,
    ): Promise<void>;

    /**
     * Creates new exclusion constraints.
     */
    createExclusionConstraints(
        table: Table | string,
        exclusionConstraints: TableExclusion[],
    ): Promise<void>;

    /**
     * Drops a exclusion constraint.
     */
    dropExclusionConstraint(
        table: Table | string,
        exclusionOrName: TableExclusion | string,
    ): Promise<void>;

    /**
     * Drops exclusion constraints.
     */
    dropExclusionConstraints(
        table: Table | string,
        exclusionConstraints: TableExclusion[],
    ): Promise<void>;

    /**
     * 새로운 외래키를 생성한다.
     */
    createForeignKey(table: Table | string, foreignKey: TableForeignKey): Promise<void>;

    /**
     * 새로운 외래키들을 생성하도록 한다.
     */
    createForeignKeys(table: Table | string, foreignKeys: TableForeignKey[]): Promise<void>;

    /**
     * 외래키를 지운다.
     */
    dropForeignKey(
        table: Table | string,
        foreignKeyOrName: TableForeignKey | string,
    ): Promise<void>;

    /**
     * 외래키들을 지운다.
     */
    dropForeignKeys(table: Table | string, foreignKeys: TableForeignKey[]): Promise<void>;

    /**
     * 새로운 Index를 생성하도록 한다.
     */
    createIndex(table: Table | string, index: TableIndex): Promise<void>;

    /**
     * 새로운 Index들을 생성하도록 한다.
     */
    createIndexes(table: Table | string, indexes: TableIndex[]): Promise<void>;

    /**
     * Index를 제거한다.
     */
    dropIndex(table: Table | string, index: TableIndex | string): Promise<void>;

    /**
     * Index들을 제거하도록 한다.
     */
    dropIndices(table: Table | string, indices: TableIndex[]): Promise<void>;

    /**
     * Table의 모든 내용을 비우도록 한다.
     */
    clearTable(tableName: string): Promise<void>;

    /**
     * QueryExecutor에서 Query가 실행되면
     * SQLMemory에 쌓아지도록 한다.
     */
    enableSqlMemory(): void;

    /**
     * QueryExecutor Mode에서 Query가 실행되지 않도록하려면
     * `disableSqlMemory()` 메소드를 실행하도록 한다.
     *
     * 이전에 memory는 flush 되도록 한다.
     */
    disableSqlMemory(): void;

    /**
     * SQLMemory를 비우도록 한다.
     */
    clearSqlMemory(): void;

    /**
     * SQLMemory를 가져도오록 한다.
     */
    getMemorySql(): SQLMemory;

    /**
     * Executes up sql queries
     */
    executeSQLUpMemory(): Promise<void>;

    /**
     * Executes down sql queries
     */
    executeSQLDownMemory(): Promise<void>;
}
