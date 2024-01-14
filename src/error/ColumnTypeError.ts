/* eslint-disable @typescript-eslint/ban-types */

import { CQError } from './CQError';

/**
 * `ColumnTypeError.ts`
 *
 * ColumnTypeError class를 정의한다.
 */
export class ColumnTypeError extends CQError {
    constructor(obj: Object, propertyName: string) {
        super(`Column type ${obj.constructor}:${propertyName} is not defined and cannot be guess.`);
    }
}
