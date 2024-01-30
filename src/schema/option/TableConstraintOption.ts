/**
 * `TableConstraintOption.ts`
 *
 * Database의 Table 제약조건에 대한 Option을 정의한다.
 */
export interface TableConstraintOption {
    /**
     * 제약조건에 대한 이름을 정의한다.
     */
    name?: string;

    /**
     * Column에 걸린 제약조건에 대한 일므을 명시한다.
     */
    columnNames?: string[];

    /**
     * Expression check.
     */
    expression?: string;
}
