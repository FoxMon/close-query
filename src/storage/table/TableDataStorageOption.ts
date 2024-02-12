/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../../manager/Manager';
import { SelectQueryBuilder } from '../../query/builder/SelectQueryBuilder';
import { OrderByType } from '../../types/OrderByType';
import { TableType } from '../types/TableType';

/**
 * `TableDataStorageOption.ts`
 */
export interface TableDataStorageOption {
    /**
     * 대상이 될 Target을 명시하도록 한다.
     */
    target: Function | string;

    /**
     * Table의 이름을 명시하도록 한다.
     */
    name?: string;

    /**
     * Table의 Type을 명시하도록 한다.
     */
    type: TableType;

    /**
     * Order by 조건을 명시하도록 한다.
     */
    orderBy?: OrderByType | ((object: any) => OrderByType | any);

    /**
     * Table's database engine type (like "InnoDB", "MyISAM", etc).
     */
    engine?: string;

    /**
     * Database name.
     */
    database?: string;

    /**
     * Schema name.
     */
    schema?: string;

    /**
     * Sync를 맞출지 설정하도록 한다.
     */
    synchronize?: boolean;

    /**
     * View expression.
     */
    expression?: string | ((manager: Manager) => SelectQueryBuilder<any>);

    /**
     * View dependencies.
     */
    dependsOn?: Set<Function | string>;

    /**
     * Materialized
     */
    materialized?: boolean;

    /**
     * Without row id
     */
    withoutRowid?: boolean;

    /**
     * Table에 대한 comment를 명시하도록 한다.
     */
    comment?: string;
}
