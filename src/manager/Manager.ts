import { Connector } from '../connector/Connector';
import { ConnectorFactory } from '../connector/ConnectorFactory';
import { ObjectUtil } from '../utils/ObjectUtil';
import { ManagerOptions } from './ManagerOptions';
import { ManagerConnectError } from '../error/ManagerConnectError';
import { Naming } from '../naming/Naming';
import { DefaultNaming } from '../naming/DefaultNaming';

/**
 * `Manager.ts`
 *
 * Manager는 Database에 연결하기 전 미리 Database의 설정과 같은 것들을 정의할 때
 * 사용되는 class 이다.
 */
export class Manager {
    readonly '_instance' = Symbol.for('Manager');

    readonly options: ManagerOptions;

    /**
     * Manager가 초기화가 됐는지에 대한 Flag.
     * 초기화가 진행됐다면 `true`, 아니라면 `false`.
     */
    readonly isInitialized: boolean;

    readonly manager: Connector;

    readonly storageTableName: string;

    naming: Naming;

    constructor(options: ManagerOptions) {
        this.options = options;

        this.isInitialized = false;

        this.manager = new ConnectorFactory().createConnector(this);

        this.storageTableName = options.storageTableName || 'close_query_storage_data';

        this.naming = this.options.naming || new DefaultNaming();
    }

    setOptions(options: Partial<ManagerOptions>) {
        Object.assign(this.options, options);

        if (options.naming) {
            this.naming = options.naming;
        }

        return this;
    }

    async initialize(): Promise<this> {
        if (this.isInitialized) {
            throw new ManagerConnectError(this.options.type);
        }

        await this.manager.connect();

        ObjectUtil.assign(this, { isInitialized: true });

        return this;
    }
}
