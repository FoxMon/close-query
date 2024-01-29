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
import { Replication } from '../types/Replication';
import { EntityManagerFactory } from './EntityManagerFactory';
import { QueryExecutorAlreadyReleasedError } from '../error/QueryExecutorAlreadyReleasedError';
import { EntityTarget } from '../types/entity/EntityTarget';
import { CQDataStorage } from '../storage/CQDataStorage';
import { CQError } from '../error/CQError';
import { CheckerUtil } from '../utils/CheckerUtil';
import { ConnectorBuilder } from '../connector/ConnectorBuilder';
import { EventSubscriber } from '../event/EventSubscriber';

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

    readonly dataStorageMap = new Map<EntityTarget<any>, CQDataStorage>();

    readonly subscribers: EventSubscriber<any>[] = [];

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

        try {
            /**
             * @TODO
             *      Metadata 설정은?
             */
        } catch (error) {
            await this.destroy();

            throw new CQError(`Cannot initialize manager ! initialize()`);
        }

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

    async query<T = any>(query: string, params?: any[], queryExecutor?: QueryExecutor): Promise<T> {
        if (queryExecutor && queryExecutor.isReleased) {
            throw new QueryExecutorAlreadyReleasedError();
        }

        const createdQueryExecutor = queryExecutor || this.createQueryExecutor();

        try {
            return await createdQueryExecutor.query(query, params);
        } finally {
            if (!queryExecutor) {
                await createdQueryExecutor.release();
            }
        }
    }

    findDataStorage(target: EntityTarget<any>) {
        const dataStorageMap = this.dataStorageMap.get(target);

        if (dataStorageMap) {
            return dataStorageMap;
        }

        for (const [_, storage] of this.dataStorageMap) {
            if (CheckerUtil.checkIsCQDataStorage(target) && storage.name === target.option.name) {
                return storage;
            }

            if (typeof target === 'string') {
                if (target.indexOf('.') !== -1) {
                    if (storage.tablePath === target) {
                        return storage;
                    }
                } else {
                    if (storage.name === target || storage.tableName === target) {
                        return storage;
                    }
                }
            }

            if (ObjectUtil.withName(target) && typeof target.name === 'string') {
                if (target.name.indexOf('.') !== -1) {
                    if (storage.tablePath === target.name) {
                        return storage;
                    }
                } else {
                    if (storage.name === target.name || storage.tableName === target.name) {
                        return storage;
                    }
                }
            }
        }

        return undefined;
    }

    hasDataStoraget(target: EntityTarget<any>) {
        return !!this.findDataStorage(target);
    }

    getDataStorage(target: EntityTarget<any>) {
        const dataStorage = this.findDataStorage(target);

        if (!dataStorage) {
            throw new CQError(`Cannot find DataStorage ${target} !`);
        }

        return dataStorage;
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

    createEntityManager(queryExecutor?: QueryExecutor) {
        return new EntityManagerFactory().create(this, queryExecutor);
    }

    createQueryExecutor(mode: Replication = 'source'): QueryExecutor {
        const queryExecutor = this.connector.createQueryExecutor(mode);
        const entityManager = this.createEntityManager(queryExecutor);

        ObjectUtil.assign(queryExecutor, {
            manager: entityManager,
        });

        return queryExecutor;
    }

    createQueryBuilder(queryExecutor?: QueryExecutor): SelectQueryBuilder<any>;
    createQueryBuilder<Entity extends ObjectIndexType>(
        entity: EntityTarget<Entity>,
        alias: string,
        queryExecutor?: QueryExecutor,
    ): SelectQueryBuilder<Entity>;
    createQueryBuilder<Entity extends ObjectIndexType>(
        entityOrExecutor?: EntityTarget<Entity> | QueryExecutor,
        alias?: string,
        queryExecutor?: QueryExecutor,
    ): SelectQueryBuilder<Entity> {
        if (alias) {
            if (alias) {
                alias = ConnectorBuilder.buildAlias(this.connector, undefined, alias);

                const dataStorage = this.getDataStorage(queryExecutor as EntityTarget<Entity>);

                return new SelectQueryBuilder(this, queryExecutor)
                    .select(alias)
                    .from(dataStorage.target, alias);
            } else {
                return new SelectQueryBuilder(this, entityOrExecutor as QueryExecutor | undefined);
            }
        } else {
            return new SelectQueryBuilder(this, entityOrExecutor as QueryExecutor | undefined);
        }
    }
}
