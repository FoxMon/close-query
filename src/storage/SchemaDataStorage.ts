/* eslint-disable @typescript-eslint/ban-types */

import { EmbeddedDataStorageOption } from './EmbeddedDataStorageOption';
import { GeneratedDataStorageOption } from './GeneratedDataStorageOption';
import { RelationDataStorageOption } from './RelationDataStorageOption';
import { UniqueOption } from './UniqueDataStorageOption';
import { ColumnDataStorageOption } from './column/ColumnDataStorageOption';
import { TableDataStorage } from './table/TableDataStorage';

/**
 * `SchemaDataStorage.ts`
 *
 * Schema에 관련된 Data를 전역적으로 관리하기 위해서 DataStorage에 넣어 관리한다.
 * 따라서 데이터의 불변성을 일관되게 유지하는 것이 중요하기 때문에 특별히 주의해서
 * 사용하도록 한다.
 */
export class SchemaDataStorage {
    readonly '_instance' = Symbol.for('SchemaDataStorage');

    readonly tables: TableDataStorage[] = [];

    readonly columns: ColumnDataStorageOption[] = [];

    readonly embeddeds: EmbeddedDataStorageOption[] = [];

    readonly uniques: UniqueOption[] = [];

    readonly relations: RelationDataStorageOption[] = [];

    readonly generations: GeneratedDataStorageOption[] = [];

    filterTable(targetTalbe: Function | string): TableDataStorage[];
    filterTable(targetTalbe: (Function | string)[]): TableDataStorage[];
    filterTable(targetTable: (Function | string) | (Function | string)[]): TableDataStorage[] {
        return this.filterTarget(this.tables, targetTable);
    }

    filterColumn(target: Function | string): ColumnDataStorageOption[];
    filterColumn(target: (Function | string)[]): ColumnDataStorageOption[];
    filterColumn(target: (Function | string) | (Function | string)[]): ColumnDataStorageOption[] {
        return this.filterDuplicateTarget(this.columns, target);
    }

    filterEmbedded(target: Function | string): EmbeddedDataStorageOption[];
    filterEmbedded(target: (Function | string)[]): EmbeddedDataStorageOption[];
    filterEmbedded(
        target: (Function | string) | (Function | string)[],
    ): EmbeddedDataStorageOption[] {
        return this.filterDuplicateTarget(this.embeddeds, target);
    }

    filterUnique(target: Function | string): UniqueOption[];
    filterUnique(target: (Function | string)[]): UniqueOption[];
    filterUnique(target: (Function | string) | (Function | string)[]): UniqueOption[] {
        return this.uniques.filter((unique) => {
            return Array.isArray(target)
                ? target.indexOf(unique.target) !== -1
                : unique.target === target;
        });
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

    filterDuplicateTarget<T extends { target: Function | string; propertyName: string }>(
        arr: T[],
        target: (Function | string) | (Function | string)[],
    ): T[] {
        const filteredArr: T[] = [];

        arr.forEach((el) => {
            const duplicateItem = Array.isArray(target)
                ? target.indexOf(el.target) === -1
                : el.target === target;

            if (duplicateItem) {
                if (!filteredArr.find((a) => a.propertyName === el.propertyName)) {
                    filteredArr.push(el);
                }
            }
        });

        return filteredArr;
    }
}
