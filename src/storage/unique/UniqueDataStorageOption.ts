/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { DeferrableType } from '../../types/DeferrableType';

/**
 * `UniqueDataStorageOption.ts`
 *
 * Unique에 대한 Option을 정의한다.
 */
export interface UniqueDataStorageOption {
    /**
     * Unique가 적용될 target에 대한 정보이다.s
     */
    target: Function | string;

    /**
     * Unique 제약 조건을 걸어 놓도록 한다.
     */
    name?: string;

    /**
     * Unique와 함께 사용될 column의 정보이다.
     */
    columns?: ((object?: any) => any[] | { [key: string]: number }) | string[];

    /**
     * Unique제약 조건에 `deffered` 옵션이 들어가는지 나타내도록 한다.
     */
    deferrable?: DeferrableType;
}
