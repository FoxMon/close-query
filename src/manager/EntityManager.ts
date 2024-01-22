/* eslint-disable @typescript-eslint/no-explicit-any */

import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { EntityTarget } from '../types/entity/EntityTarget';
import { ObjectUtil } from '../utils/ObjectUtil';
import { Manager } from './Manager';

/**
 * `EntityManager.ts`
 *
 * Entity를 관리하는 Manager를 정의하는 class이다.
 */
export class EntityManager {
    readonly '_instance' = Symbol.for('EntityManager');

    readonly manager: Manager;

    readonly queryExecutor: QueryExecutor;

    constructor(manager: Manager, queryExecutor?: QueryExecutor) {
        this.manager = manager;

        if (queryExecutor) {
            this.queryExecutor = queryExecutor;

            ObjectUtil.assign(this.queryExecutor, {
                manager: this,
            });
        }
    }

    async query<T = any>(query: string, params?: any[]): Promise<T> {
        return this.manager.query(query, params, this.queryExecutor);
    }

    createQueryBuilder(queryExecutor?: QueryExecutor): SelectQueryBuilder<any>;
    createQueryBuilder<Entity extends ObjectIndexType>(
        entity: EntityTarget<Entity>,
        alias?: string,
        queryExecutor?: QueryExecutor,
    ): SelectQueryBuilder<Entity>;
    createQueryBuilder<Entity extends ObjectIndexType>(
        entity?: EntityTarget<Entity> | QueryExecutor,
        alias?: string,
        queryExecutor?: QueryExecutor,
    ): SelectQueryBuilder<Entity> {
        if (alias) {
            return this.manager.createQueryBuilder(
                entity as EntityTarget<Entity>,
                alias,
                queryExecutor || this.queryExecutor,
            );
        } else {
            return this.manager.createQueryBuilder(
                (entity as QueryExecutor | undefined) || queryExecutor || this.queryExecutor,
            );
        }
    }
}
