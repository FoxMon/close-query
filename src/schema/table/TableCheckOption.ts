/**
 * `TableCheckOptions.ts`
 */
export interface TableCheckOption {
    /**
     * 제약조건 이름
     */
    name?: string;

    /**
     * 제약조건이 걸릴 column 이름
     */
    columnNames?: string[];

    /**
     * Expression
     */
    expression?: string;
}
