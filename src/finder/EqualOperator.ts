import { FindOperator } from './FindOperator';

/**
 * `EqualOperator.ts`
 */
export class EqualOperator<T> extends FindOperator<T> {
    readonly _instance = Symbol.for('EqualOperator');

    constructor(value: T | FindOperator<T>) {
        super('equal', value);
    }
}
