/* eslint-disable @typescript-eslint/no-explicit-any */

import { FindOperator } from './FindOperation';

/**
 * `In.ts`
 *
 * @param {FindOperator<T> | T[]} value
 * @returns {FindOperator}
 */
export function In<T>(value: readonly T[] | FindOperator<T>): FindOperator<any> {
    return new FindOperator('in', value as any, true, true);
}
