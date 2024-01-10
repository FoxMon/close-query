/* eslint-disable @typescript-eslint/ban-types */

import { ColumnType } from '../../types/column/ColumType';

/**
 * `ColumnOption.ts`
 *
 * Database에서 어느 Table의 Column을 표현할 때 사용되는 Option을 정의하도록 한다.
 */
export interface ColumnOption {
    /**
     * Table Column의 type을 지정할 때 사용하는 type을 명시하도록 한다.
     */
    type?: ColumnType;

    /**
     * Column의 이름을 명시하도록 한다.
     */
    name?: string;

    /**
     * Column의 length를 지정하도록 한다.
     */
    length?: string | number;

    /**
     * Column의 width.
     */
    width?: number;

    /**
     * Column의 field 값을 null을 허용할 것인지에 대한 여부를
     * 결정하도록 한다.
     */
    nullable?: boolean;

    /**
     * PK인지 나타내는 필드.
     */
    primary?: boolean;

    /**
     * Unique인지 나타내는 필드.
     */
    unique?: boolean;

    /**
     * 수 에서의 precision 필드.
     */
    precision?: number | null;

    /**
     *
     */
    scale?: number;

    /**
     *
     */
    collation?: string;

    /**
     *
     */
    enum?: (string | number)[] | Object;

    /**
     *
     */
    enumName?: string;

    /**
     *
     */
    primaryKeyName?: string;

    /**
     *
     */
    foreignKeyName?: string;
}
