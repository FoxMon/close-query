/* eslint-disable @typescript-eslint/ban-types */

import { ClosureTreeOption } from './types/ClosureTreeOption';
import { TreeType } from './types/TreeType';

/**
 * `TreeDataStorageOption.ts`
 */
export interface TreeDataStorageOption {
    /**
     * 대상이 될 target을 명시하도록 한다.
     */
    target: Function | string;

    /**
     * Tree의 Type을 명시한다.
     */
    type: TreeType;

    /**
     * Tree의 Option을 명시하도록 한다.
     */
    options?: ClosureTreeOption;
}
