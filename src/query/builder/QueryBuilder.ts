/* eslint-disable @typescript-eslint/no-explicit-any */

import { Manager } from '../../manager/Manager';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { QueryExecutor } from '../executor/QueryExecutor';
import { SelectQueryBuilder } from './SelectQueryBuilder';

/**
 * `QueryBuilder.ts`
 *
 * Query를 수행하는 Class를 정의한다.
 */
export abstract class QueryBuilder<Entity extends ObjectIndexType> {
    readonly '_instance' = Symbol.for('QueryBuilder');

    readonly connector: Manager;

    readonly queryExecutor: QueryExecutor;

    static queryBuilderRegistry: Record<string, any> = {};

    constructor(queryBuilder: QueryBuilder<any>);

    constructor(connector: Manager | QueryBuilder<any>, queryExecutor?: QueryExecutor) {
        if (CheckerUtil.checkIsManager(connector)) {
            this.connector = connector;

            this.queryExecutor = queryExecutor as QueryExecutor;
        } else {
            this.connector = connector.connector;

            this.queryExecutor = connector.queryExecutor;
        }
    }

    abstract getQuery(): string;

    createQueryBuilder() {
        return new (this.connector as any)(this.connector, this.queryExecutor);
    }

    select(select?: string | string[], selectAliasName?: string): SelectQueryBuilder<Entity> {
        if (Array.isArray(select)) {
            /**
             * @TODO 뭔가 더 해야함
             */
        } else if (select) {
            /**
             * @TODO 뭔가 더 해야함
             */
        }

        return QueryBuilder.queryBuilderRegistry['SelectQueryBuilder'](this);
    }
}
