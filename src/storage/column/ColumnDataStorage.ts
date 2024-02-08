/* eslint-disable @typescript-eslint/ban-types */

import { ColumnType } from '../../types/column/ColumType';

/**
 * `ColumnDataStorage.ts`
 *
 * Column에 대한 DataStorage를 관리하는 Class를 정의한다.
 */
export class ColumnDataStorage {
    readonly '_instance' = Symbol.for('ColumnDataStorage');

    target: Function | string;

    propertyPath: string;

    propertyName: string;

    databasePath: string;

    databaseName: string;

    type: ColumnType;

    length: string = '';

    width?: number;

    collation?: string;

    isPrimary: boolean = false;

    isNullable: boolean = false;

    isDiscriminator: boolean = false;

    generationStrategy?: 'uuid' | 'increment' | 'rowid';

    referencedColumn: ColumnDataStorage | undefined;

    query?: (alias: string) => string;
}
