/* eslint-disable @typescript-eslint/ban-types */

import { DataStorageListenerType } from './types/DataStorageListenerType';

/**
 * `DataStorageListenerOption.ts`
 */
export interface DataStorageListenerOption {
    readonly target: Function;

    readonly propertyName: string;

    readonly type: DataStorageListenerType;
}
