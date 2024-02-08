/**
 * `TableExclusionOption.ts`
 *
 * Database의 테이블 exclusion 제약조건을 설정하도록 한다.
 */
export interface TableExclusionOption {
    /**
     * 제약조건 이름
     */
    name?: string;

    /**
     * Expression
     */
    expression?: string;
}
