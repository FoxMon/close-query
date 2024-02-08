/* eslint-disable @typescript-eslint/ban-types */

/**
 * `ExclusionDataStorageOption.ts`
 */
export interface ExclusionDataStorageOption {
    /**
     * 적용될 target
     */
    target: Function | string;

    /**
     * Exclusion 제약조건 이름
     */
    name?: string;

    /**
     * Expression
     */
    expression: string;
}
