import { CQError } from './CQError';

/**
 * `ConnectorNotInstalledError.ts`
 *
 * Connector 연결 시 Dependency가 설치되지 않은 경우에 대한 Error class를 정의.
 */
export class ConnectorNotInstalledError extends CQError {
    readonly '_instance' = Symbol.for('ConnectorNotInstalledError');

    constructor(connectorName: string, packageName: string) {
        super(
            `Cannot connect ${connectorName}. 'MysqlConnector.loadConnectorDependencies'. Package name: ${packageName}.`,
        );
    }
}
