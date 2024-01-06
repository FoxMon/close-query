import { CQError } from './CQError';

/**
 * `ManagerConnectError.ts`
 *
 * Manager 연결 시 throw 할 Error 정의
 */
export class ManagerConnectError extends CQError {
    constructor(connectorName: string) {
        super(`Cannot connect a "${connectorName}". Because the database is already connected.`);
    }
}
