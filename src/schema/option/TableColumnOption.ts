/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `TableColumnOption.ts`
 *
 * Table의 Column에 관련된 option을 정의하도록 한다.
 */
export interface TableCloumnOption {
    /**
     * Column에 대한 이름을 정의하도록 한다.
     */
    name: string;

    /**
     * Column에 대한 type을 정의하도록 한다.
     */
    type: string;

    /**
     * Column의 값이 지정될 때,
     * Default 값을 지정하도록 한다.
     */
    default?: any;

    /**
     * Null을 허용할 것인지 정의하도록 한다.
     *
     * Default: false
     */
    nullable?: boolean;

    /**
     * Table의 `Primary Key`가 될 것인지 결정하도록 한다.
     *
     * Default: false
     */
    primary?: boolean;

    /**
     * Column이 Unique한 값을 가질 것인지 지정하도록 한다.
     *
     * Default: false
     */
    unique?: boolean;

    /**
     * Column의 type에 대한 길이를 지정하도록 한다.
     * Length: `255` 라면 varchar(255)를 생성하도록 한다.
     *
     * Default: ""
     */
    length?: string;

    /**
     * Column type의 width를 나타내도록 한다.
     */
    width?: number;

    /**
     * Column의 collation을 지정하도록 한다.
     */
    collation?: string;

    /**
     * Precision
     */
    precision?: number | null;

    /**
     * Scale
     */
    scale?: number;
}
