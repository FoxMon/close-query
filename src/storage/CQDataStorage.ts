/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../manager/Manager';
import { ColumnDataStorage } from './column/ColumnDataStorage';
import { TableDataStorage } from './table/TableDataStorage';

/**
 * `CQDataStorage.ts`
 *
 * CQ의 모든 MetaData를 관리하는 Class를 정의하도록 한다.
 */
export class CQDataStorage {
    readonly '_instance' = Symbol.for('CQDataStorage');

    manager: Manager;

    tables: TableDataStorage;

    name: string;

    schema?: string;

    target: Function | string;

    targetName: string;

    database?: string;

    tableName: string;

    tablePath: string;

    synchronize: boolean = true;

    childCQDataStorages: CQDataStorage[] = [];

    discriminatorColumn?: ColumnDataStorage;
}
