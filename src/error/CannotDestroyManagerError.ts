import { CQError } from './CQError';

/**
 * `CannotDestroyManagerError.ts`
 *
 * Destroy시 발생할 에러를 정의하는 Class이다.
 */
export class CannotDestroyManagerError extends CQError {
    readonly '_instance' = Symbol.for('CannotDestroyManagerError');

    constructor() {
        super(`Cannot destroy manager. Connection not yet established.`);
    }
}
