import { CQError } from './CQError';

/**
 * `TransactionError.ts`
 */
export class TransactionError extends CQError {
    readonly _instance = Symbol.for('TransactionError');

    constructor() {
        super(`Transaction error !`);
    }
}
