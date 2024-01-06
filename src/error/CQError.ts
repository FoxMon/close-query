/**
 * `CQError.ts`
 *
 * Close-Query에서 발생하는 Error에 대한 super class 정의
 */
export class CQError extends Error {
    readonly '_instance' = Symbol.for('CQError');

    constructor(msg?: string) {
        super(msg);
    }
}
