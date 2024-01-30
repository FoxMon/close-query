/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectUtil } from '../utils/ObjectUtil';
import { CQError } from './CQError';

/**
 * `QueryFailedError.ts`
 *
 * Query가 실행 에러가 발생했을 경우 Error를 Throw하기 위한 class를 정의 한다.
 */
export class QueryFailedError<T extends Error = Error> extends CQError {
    readonly '_instance' = Symbol.for('QueryFailedError');

    constructor(
        readonly query: string,
        readonly parameters: any[] | undefined,
        readonly managerError: T,
    ) {
        super(
            managerError
                .toString()
                .replace(/^error: /, '')
                .replace(/^Error: /, '')
                .replace(/^Request/, ''),
        );

        if (managerError) {
            const { name: _, ...otherProperties } = managerError;

            ObjectUtil.assign(this, {
                ...otherProperties,
            });
        }
    }
}
