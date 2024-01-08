/* eslint-disable @typescript-eslint/no-explicit-any */

import { TableIndexOption } from '../option/TableIndexOption';

/**
 * `TableIndex.ts`
 *
 * Table에 대한 Index 관련 로직을 정의한 class 이다.
 */
export class TableIndex {
    readonly 'instance' = Symbol.for('TableIndex');

    name?: string;

    columnNames: string[] = [];

    unique?: boolean;

    constructor(options: TableIndexOption) {
        if (options) {
            this.name = options.name;

            this.columnNames = options.columnNames;

            this.unique = options.unique || false;
        }
    }

    createTableIndex(): TableIndex {
        return new TableIndex({
            name: this.name,
            columnNames: this.columnNames,
            unique: this.unique || false,
        });
    }
}
