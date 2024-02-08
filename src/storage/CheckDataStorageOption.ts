/* eslint-disable @typescript-eslint/ban-types */

/**
 * `CheckDataStorageOption.ts`
 */
export interface CheckDataStorageOption {
    /**
     * 적용될 Target
     */
    target: Function | string;

    /**
     * 제약조건 이름
     */
    name?: string;

    /**
     * Expression
     */
    expression: string;
}
