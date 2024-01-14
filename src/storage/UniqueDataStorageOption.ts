/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { DeferrableType } from '../types/DeferrableType';

/**
 * `UniqueOption.ts`
 *
 * Unique option을 지정하도록 한다.
 */
export interface UniqueOption {
    /**
     * Class의 Decorator에서 사용되므로,,,
     */
    target: Function | string;

    /**
     * Unique 제약 조건의 이름을 지정하도록 한다.
     */
    name?: string;

    /**
     * Column의 조합.
     */
    columns?: ((obj: any) => any[] | { [key: string]: number }) | string[];

    /**
     * Unique 제약 조건의 deferred 옵션을 지정하도록 한다.
     */
    deferrable?: DeferrableType;
}
