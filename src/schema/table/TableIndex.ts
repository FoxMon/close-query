/* eslint-disable @typescript-eslint/no-explicit-any */

import { TableIndexOption } from '../option/TableIndexOption';

/**
 * `TableIndex.ts`
 *
 * Table에 대한 Index 관련 로직을 정의한 class 이다.
 */
export class TableIndex {
    readonly '_instance' = Symbol.for('TableIndex');

    name?: string;

    columnNames: string[] = [];

    unique?: boolean;

    where: string;

    isSpatial: boolean;

    isConcurrent: boolean;

    isFulltext: boolean;

    isNullFiltered: boolean;

    parser?: string;

    constructor(options: TableIndexOption) {
        if (options) {
            this.name = options.name;
            this.columnNames = options.columnNames;
            this.unique = options.unique || false;
            this.where = options.where ? options.where : '';
            this.isSpatial = !!options.isSpatial;
            this.isConcurrent = !!options.isConcurrent;
            this.isFulltext = !!options.isFullText;
            this.isNullFiltered = !!options.isNullFiltered;
            this.parser = options.parser;
        }
    }

    createTableIndex(): TableIndex {
        return new TableIndex({
            name: this.name,
            columnNames: this.columnNames,
            unique: this.unique || false,
            where: this.where,
            isSpatial: this.isSpatial,
            isConcurrent: this.isConcurrent,
            isFullText: this.isFulltext,
            isNullFiltered: this.isNullFiltered,
            parser: this.parser,
        });
    }
}
