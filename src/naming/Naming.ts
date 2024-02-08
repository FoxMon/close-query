import { Table } from '../schema/table/Table';
import { View } from '../schema/view/View';

/**
 * `Naming.ts`
 *
 * Database에서 Column이나 Table 이름을 어떻게 자동으로 생성할 것이고,
 * 어떠한 전략으로 Naming을 지을 것인지에 대한 Interface를 정의한다.
 */
export interface Naming {
    /**
     * Naming 전략에 대한 Field.
     * camelCase, snake_case 등등.
     */
    name?: string;

    /**
     * Table에 대한 Column 이름을 가져 오도록 한다.
     * Parameter로 주어진 columnName을 주어진 전략에 따라 적절히 변환하여
     * 값을 반환하도록 한다.
     */
    getColumnName(columnName: string, customName: string, prefixes: string[]): string;

    /**
     * 제약조건의 이름을 가져오도록 한다.
     */
    checkConstraintName(tableOrName: Table | string, expression: string, isEnum?: boolean): string;

    /**
     * Exclusion 제약조건에 대한 이름을 가져오도록 한다.
     */
    exclusionConstraintName(tableOrName: Table | string, expression: string): string;

    /**
     * Unique 제약조건의 이름을 가져오도록 한다.
     */
    uniqueConstraintName(tableOrName: Table | string, columnNames: string[]): string;

    /**
     * Index의 이름을 지정하도록 한다.
     */
    indexName(tableOrName: Table | View | string, columns: string[], where?: string): string;

    /**
     * Foreign Key 이름을 지정하도록 한다.
     */
    foreignKeyName(
        tableOrName: Table | string,
        columnNames: string[],
        referencedTablePath?: string,
        referencedColumnNames?: string[],
    ): string;
}
