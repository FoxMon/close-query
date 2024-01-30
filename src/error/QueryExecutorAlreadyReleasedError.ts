import { CQError } from './CQError';

/**
 * `QueryExecutorAlreadyReleasedError.ts`
 *
 * QueryExecutor에서 이미 released된 상태인데 실행하려는 경우
 * Error를 처리하기 위한 class 이다.
 */
export class QueryExecutorAlreadyReleasedError extends CQError {
    readonly 'QueryFailedError' = Symbol.for('QueryExecutorAlreadyReleasedError');

    constructor() {
        super(`The query executor is already released!`);
    }
}
