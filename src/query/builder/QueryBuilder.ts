/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from '../../error/CQError';
import { Manager } from '../../manager/Manager';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { QueryExpression } from '../QueryExpression';
import { QueryExecutor } from '../executor/QueryExecutor';
import { SelectQueryBuilder } from './SelectQueryBuilder';

/**
 * `QueryBuilder.ts`
 *
 * Query를 수행하는 Class를 정의한다.
 */
export abstract class QueryBuilder<Entity extends ObjectIndexType> {
    readonly '_instance' = Symbol.for('QueryBuilder');

    readonly manager: Manager;

    readonly queryExecutor: QueryExecutor;

    readonly queryExpression: QueryExpression;

    static queryBuilderRegistry: Record<string, any> = {};

    parentQueryBuilder: QueryBuilder<any>;

    constructor(queryBuilder: QueryBuilder<any>);
    constructor(queryBuilder: Manager, queryExecutor?: QueryExecutor);
    constructor(manager: Manager | QueryBuilder<any>, queryExecutor?: QueryExecutor) {
        if (CheckerUtil.checkIsManager(manager)) {
            this.manager = manager;

            this.queryExecutor = queryExecutor as QueryExecutor;

            this.queryExpression = new QueryExpression(this.manager);
        } else {
            this.manager = manager.manager;

            this.queryExecutor = manager.queryExecutor;

            /**
             * @TODO
             *      아닐때는?? queryExpression 어떻게?
             */
        }
    }

    abstract getQuery(): string;

    async execute(): Promise<any> {
        const [sql, params] = this.getQueryAndParams();
        const queryExecutor = this.getQueryExecutor();

        try {
            return await queryExecutor.query(sql, params);
        } finally {
            if (queryExecutor !== this.queryExecutor) {
                await queryExecutor.release();
            }
        }
    }

    createQueryBuilder() {
        return new (this.manager as any)(this.manager, this.queryExecutor);
    }

    getQueryExecutor() {
        return this.queryExecutor || this.manager.createQueryExecutor();
    }

    getQueryAndParams(): [string, any[]] {
        const query = this.getQuery();
        const params = this.getParams();

        return this.manager.connector.queryAndParams(
            query,
            params,
            this.queryExpression.nativeParams,
        );
    }

    getParams(): ObjectIndexType {
        const parameters: ObjectIndexType = Object.assign({}, this.queryExpression.params);

        if (this.queryExpression.asSyntax && this.queryExpression.asSyntax.dataStorage) {
            const cqDataStorage = this.queryExpression.asSyntax!.getDataStorage();

            /**
             * @TODO CQDataStorage에 뭔가 해야함
             */
        }

        return parameters;
    }

    setParam(key: string, value: any) {
        if (typeof value === 'function') {
            throw new CQError(
                `Params isn't supported in the parameters. Please check ${key} parameter.`,
            );
        }

        if (!key.match(/^([A-Za-z0-9_.]+)$/)) {
            throw new CQError(
                'QueryBuilder parameter keys may only contain numbers, letters, underscores, or periods.',
            );
        }

        if (this.parentQueryBuilder) {
            this.parentQueryBuilder.setParam(key, value);
        }

        this.queryExpression.params[key] = value;

        return this;
    }

    setParams(params: ObjectIndexType) {
        for (const [k, v] of Object.entries(params)) {
            this.setParam(k, v);
        }

        return this;
    }

    select(): SelectQueryBuilder<Entity>;
    select(select: string[]): SelectQueryBuilder<Entity>;
    select(select: string, selectAliasName?: string): SelectQueryBuilder<Entity>;
    select(select?: string | string[], selectAliasName?: string): SelectQueryBuilder<Entity> {
        this.queryExpression.queryType = 'select';

        if (Array.isArray(select)) {
            this.queryExpression.selects = select.map((s) => ({ select: s }));
        } else if (select) {
            this.queryExpression.selects = [
                {
                    select: select,
                    aliasName: selectAliasName,
                },
            ];
        }

        if (CheckerUtil.checkIsSelectQueryBuilder(this)) {
            return this;
        }

        return QueryBuilder.queryBuilderRegistry['SelectQueryBuilder'](this);
    }
}