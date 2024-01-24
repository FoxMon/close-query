/* eslint-disable @typescript-eslint/no-explicit-any */

import { ManagerOptions } from '../manager/ManagerOptions';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { DefaultDataType } from '../types/DefaultDataType';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { Replication } from '../types/Replication';

/**
 * `Connector.ts`
 *
 * Database에 Connect할 대상의 공통 interface
 */
export interface Connector {
    /**
     * Connector에 대한 option을 정의하도록 한다.
     */
    options: ManagerOptions;

    /**
     * 기본적인 precision, scale, length와 같은 default values에 해당하는 type.
     */
    defaultDataTypes: DefaultDataType;

    /**
     * Alias에 대한 최대값을 설정하도록 하는 필드이다.
     */
    maxAliasLength?: number;

    /**
     * Database와 Connect을 수행하도록 한다.
     * 대상 Database가 무엇인지에 따라서 약간의 차이가 존재할 수도 있다.
     */
    connect(): Promise<void>;

    /**
     * Database와의 접속을 끊는 작업을 수행하도록 한다.
     */
    disconnect(): Promise<void>;

    /**
     * Database의 이름과 Table, Schema의 이름을 생성하도록 한다.
     * foxmonDatabase.foxmon.foxmonTable
     */
    generateTableName(tableName: string, schema?: string, database?: string): string;

    /**
     * QueryExecutor를 생성하도록 한다.
     */
    createQueryExecutor(mode: Replication): QueryExecutor;

    /**
     * 주어진 SQL에서 Params를 잘 다듬도록 한다.
     */
    queryAndParams(
        sql: string,
        params: ObjectIndexType,
        nativeParams: ObjectIndexType,
    ): [string, any[]];
}
