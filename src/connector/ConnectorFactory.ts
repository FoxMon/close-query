import { Manager } from '../manager/Manager';
import { Connector } from './Connector';
import { MysqlConnector } from './mysql/MysqlConnector';

/**
 * `ConnectorFactory.ts`
 *
 * Connector 객체를 생성하기 위한 factory class 정의.
 */
export class ConnectorFactory {
    readonly '_instance' = Symbol.for('ConnectorFactory');

    createConnector(connector: Manager): Connector {
        const { type } = connector.options;

        switch (type) {
            case 'mysql':
                return new MysqlConnector(connector);

            /**
             * @TODO
             *      일단 임시로 MysqlConnector로 연결해 놓지만 이러한 처리에 대한
             *      고민이 필요해 보인다
             */
            default:
                return new MysqlConnector(connector);
        }
    }
}
