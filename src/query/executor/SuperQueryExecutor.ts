/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventBroadCaster } from '../../event/EventBroadCaster';
import { EntityManager } from '../../manager/EntityManager';
import { Manager } from '../../manager/Manager';
import { Table } from '../../schema/table/Table';
import { Replication } from '../../types/Replication';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { QueryStore } from '../QueryStore';
import { SQLMemory } from '../SQLMemory';

/**
 * `SuperQueryExecutor.ts`
 *
 * Query를 실행시키는 class의 추상화.
 */
export abstract class SuperQueryExecutor {
    readonly 'instance' = Symbol.for('SuperQueryExecutor');

    /**
     * Query를 실행하기 위해선 Manager와의 연결이 필요한데
     * 해당 필드가 Manager에 대한 정보를 담고 있다.
     */
    manager: Manager;

    /**
     * Transaction이 수행 중인지 확인하는 필드이다.
     */
    isTransaction: boolean = false;

    /**
     * 한 번 Released 되면, 더 이상 Querry를 수행할 수 없다.
     */
    isReleased: boolean = false;

    /**
     * 실제로 Query를 수행할 때 Connection pool에 있는 Database를
     * 활용할 때 사용되는 connector이다.
     */
    databaseConnector: any;

    /**
     * `source-replica` 관계.
     */
    replicationMode: Replication;

    /**
     * Database에 있는 모든 Table을 담고 있는 Array를 정의한다.
     * Database와의 sync를 맞추도록 한다.
     */
    loadedTables: Table[] = [];

    /**
     * SQLMemory mode를 활성화 할 경우 사용하도록 한다.
     */
    sqlMemory: SQLMemory = new SQLMemory();

    /**
     * SQLMemory mode를 활성화 할 경우 `true`,
     * 비활성화 할 경우 `false`로 설정한다.
     */
    sqlMemoryMode: boolean = false;

    /**
     * 임시로 Data를 저장하는 필드.
     * Subscriber끼리 Data를 공유할 때 유용하게 하기 위함.
     */
    data = {};

    /**
     * Entity Manager
     */
    entityManager: EntityManager;

    /**
     * QueryExecutor가 Entity에게 Broadcast하기 위함.
     */
    eventBroadCaster: EventBroadCaster;

    /**
     * 주어진 `QUERY`를 실행하는 함수를 추상화 한다.
     */
    abstract query(query: string, params?: any[], useStructuredResult?: boolean): Promise<any>;

    /**
     * Table의 정보를 가져오는 함수를 추상화 하도록 한다.
     */
    abstract loadTables(tablePaths?: string[]): Promise<Table[]>;

    async getTable(tablePath: string): Promise<Table | undefined> {
        this.loadedTables = await this.loadTables([tablePath]);

        return this.loadedTables.length > 0 ? this.loadedTables[0] : undefined;
    }

    async getTables(tableNames?: string[]): Promise<Table[]> {
        if (!tableNames) {
            return await this.loadTables(tableNames);
        }

        this.loadedTables = await this.loadTables(tableNames);

        return this.loadedTables;
    }

    getReplicaMode() {
        return this.replicationMode;
    }

    getSQLMemory() {
        return this.sqlMemory;
    }

    enableSQLMemory() {
        this.sqlMemory = new SQLMemory();

        this.sqlMemoryMode = true;
    }

    disableSQLMemory() {
        this.sqlMemory = new SQLMemory();

        this.sqlMemoryMode = false;
    }

    clearSQLMemory() {
        this.sqlMemory = new SQLMemory();
    }

    async executeSQLUpMemory() {
        const { upQueries } = this.sqlMemory;

        for (const { query, params } of upQueries) {
            await this.query(query, params);
        }
    }

    async executeSQLDownMemory() {
        const { downQueries } = this.sqlMemory;

        for (const { query, params } of downQueries.reverse()) {
            await this.query(query, params);
        }
    }

    async executeQueries(
        upQueries: QueryStore | QueryStore[],
        downQueries: QueryStore | QueryStore[],
    ) {
        if (CheckerUtil.checkIsQueryStore(upQueries)) {
            upQueries = [upQueries];
        }

        if (CheckerUtil.checkIsQueryStore(downQueries)) {
            downQueries = [downQueries];
        }

        this.sqlMemory.upQueries.push(...upQueries);
        this.sqlMemory.downQueries.push(...downQueries);

        if (this.sqlMemoryMode) {
            return Promise.resolve() as Promise<any>;
        }

        for (const { query, params } of upQueries) {
            await this.query(query, params);
        }
    }

    enableSqlMemory() {
        this.sqlMemory = new SQLMemory();
        this.sqlMemoryMode = true;
    }

    disableSqlMemory() {
        this.sqlMemory = new SQLMemory();
        this.sqlMemoryMode = false;
    }

    clearSqlMemory() {
        this.sqlMemory = new SQLMemory();
    }

    getMemorySql() {
        return this.sqlMemory;
    }

    getReplicationMode() {
        return this.replicationMode;
    }
}
