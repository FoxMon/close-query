/* eslint-disable @typescript-eslint/ban-types */

import { TableDataStorage } from './table/TableDataStorage';

/**
 * `SchemaDataStorage.ts`
 *
 * Schema에 관련된 Data를 전역적으로 관리하기 위해서 DataStorage에 넣어 관리한다.
 * 따라서 데이터의 불변성을 일관되게 유지하는 것이 중요하기 때문에 특별히 주의해서
 * 사용하도록 한다.
 */
export class SchemaDataStorage {
    readonly 'instance' = Symbol.for('SchemaDataStorage');

    readonly tables: TableDataStorage[] = [];

    filterTable(targetTalbe: Function | string): TableDataStorage[];
    filterTable(targetTalbe: (Function | string)[]): TableDataStorage[];
    filterTable(targetTable: (Function | string) | (Function | string)[]): TableDataStorage[] {
        return this.filterTarget(this.tables, targetTable);
    }

    filterTarget<T extends { targetTable: Function | string }>(
        arr: T[],
        target: (Function | string) | (Function | string)[],
    ): T[] {
        return arr.filter((table: T) => {
            return Array.isArray(target)
                ? target.indexOf(table.targetTable) !== -1
                : table.targetTable === target;
        });
    }
}
