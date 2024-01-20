/* eslint-disable @typescript-eslint/no-explicit-any */

import { Connector } from '../connector/Connector';
import { ConnectorFactory } from '../connector/ConnectorFactory';
import { ObjectUtil } from '../utils/ObjectUtil';
import { ManagerOptions } from './ManagerOptions';
import { ManagerConnectError } from '../error/ManagerConnectError';
import { Naming } from '../naming/Naming';
import { DefaultNaming } from '../naming/DefaultNaming';
import { CannotDestroyManagerError } from '../error/CannotDestroyManagerError';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { EntitySchema } from '../schema/entity/EntitySchema';
import { Replication } from '../types/Replication';

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

    readonly connector: Connector;

    readonly storageTableName: string;

    naming: Naming;

    constructor(options: ManagerOptions) {
        this.options = options;

        this.isInitialized = false;

        this.connector = new ConnectorFactory().createConnector(this);

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

    async initialize() {
        if (this.isInitialized) {
            throw new ManagerConnectError(this.options.type);
        }

        await this.connector.connect();

        ObjectUtil.assign(this, { isInitialized: true });

        /**
         * @TODO
         *      Metadata 설정은?
         */

        return this;
    }

    async destroy() {
        if (!this.isInitialized) {
            throw new CannotDestroyManagerError();
        }

        await this.connector.disconnect();

        /**
         * @TODO
         *      쿼리가 만약 실행중이라면 어쩌지?
         */

        ObjectUtil.assign(this, {
            isInitialized: false,
        });
    }

    defaultReplicationMode() {
        if ('replication' in this.connector.options) {
            const value = (this.connector.options.replication as { defaultMode: Replication })
                .defaultMode;

            if (value) {
                return value;
            }
        }

        return 'source';
    }

    createQueryExecutor(mode: Replication = 'source'): QueryExecutor {
        const queryExecutor = this.connector.createQueryExecutor(mode);

        /**
         * @TODO QueryExecutor에 Manager 심어줘야함
         */

        return queryExecutor;
    }

    createQueryBuilder(queryExecutor: QueryExecutor): SelectQueryBuilder<any>;
    createQueryBuilder<Entity extends ObjectIndexType>(
        entity: EntitySchema<Entity>,
        alias: string,
        queryExecutor?: QueryExecutor,
    ): SelectQueryBuilder<Entity>;
    createQueryBuilder<Entity extends ObjectIndexType>(
        entityOrExecutor?: EntitySchema<Entity> | QueryExecutor,
        alias?: string,
        queryExecutor?: QueryExecutor,
    ): SelectQueryBuilder<Entity> {
        if (alias) {
            /**
             * @TODO QueryExecutor를 어떻게 얻지?
             */
            throw new Error('not implemented');
        } else {
            return new SelectQueryBuilder(this, entityOrExecutor as QueryExecutor | undefined);
        }
    }
}
