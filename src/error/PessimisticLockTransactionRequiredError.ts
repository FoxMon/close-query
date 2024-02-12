import { CQError } from './CQError';

/**
 * `PessimisticLockTransactionRequiredError.ts`
 */
export class PessimisticLockTransactionRequiredError extends CQError {
    constructor() {
        super(`An open transaction is required for pessimistic lock.`);
    }
}
