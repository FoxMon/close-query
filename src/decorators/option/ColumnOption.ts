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
     * Scale.
     */
    scale?: number;

    /**
     * Column의 collation 정의.
     */
    collation?: string;

    /**
     * Enumarated value가 가능한 Array를 정의한다.
     */
    enum?: (string | number)[] | Object;

    /**
     * Enum의 이름을 표헌한다.
     */
    enumName?: string;

    /**
     * 해당 Table에서 PK로 지정될 경우, Constraint의 이름을
     * 명시하도록 한다.
     */
    primaryKeyName?: string;

    /**
     * 해당 Table에서 FK로 지정될 경우, Constraint의 이름을
     * 명시하도록 한다.
     */
    foreignKeyName?: string;
}
