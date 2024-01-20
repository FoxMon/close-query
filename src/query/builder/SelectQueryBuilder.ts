/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectIndexType } from '../../types/ObjectIndexType';
import { WhereSyntax } from '../WhereSyntax';
import { QueryBuilder } from './QueryBuilder';
import { WhereExpressionBuilder } from './WhereExpressionBuilder';

/**
 * `SelectQueryBuilder.ts`
 *
 * Select query를 사용하기 위한 Select query builder class를 정의하도록 한다.
 */
export class SelectQueryBuilder<Entity extends ObjectIndexType>
    extends QueryBuilder<Entity>
    implements WhereExpressionBuilder
{
    readonly '_instance' = Symbol.for('SelectQueryBuilder');

    selects: string[] = [];

    getQuery(): string {
        throw new Error('Method not implemented.');
    }

    subQuery() {
        const queryBuilder = this.createQueryBuilder();

        queryBuilder.queryExpression.subQuery = true;
        queryBuilder.parentQueryBuilder = this;

        return queryBuilder;
    }

    select(): this;
    select(
        s: (queryBuilder: SelectQueryBuilder<any>) => SelectQueryBuilder<any>,
        selectAliasName?: string,
    ): this;
    select(s: string, selectAliasName?: string): this;
    select(s: string[]): this;
    select(
        s?:
            | string
            | string[]
            | ((queryBuilder: SelectQueryBuilder<any>) => SelectQueryBuilder<any>),
        selectAliasName?: string,
    ): SelectQueryBuilder<Entity> {
        this.queryExpression.queryType = 'select';

        if (Array.isArray(s)) {
            this.queryExpression.selects = s.map((sel) => ({ select: sel }));
        } else if (typeof s === 'function') {
            const subQueryBuilder = s(this.subQuery());

            this.setParams(subQueryBuilder.getParams());

            this.queryExpression.selects.push({
                select: subQueryBuilder.getQuery(),
                aliasName: selectAliasName,
            });
        } else if (s) {
            this.queryExpression.selects = [
                {
                    select: s,
                    aliasName: selectAliasName,
                },
            ];
        }

        return this;
    }

    where(w: string, params?: ObjectIndexType | undefined): this;
    where(w: WhereSyntax, params?: ObjectIndexType | undefined): this;
    where(where: ObjectIndexType, params?: ObjectIndexType | undefined): this;
    where(where: ObjectIndexType[], params?: ObjectIndexType | undefined): this;
    where(subQuery: (qb: this) => string, params?: ObjectIndexType | undefined): this;
    where(subQuery: unknown, params?: unknown): this {
        throw new Error('Method not implemented.');
    }

    andWhere(where: string, params?: ObjectIndexType | undefined): this;
    andWhere(where: WhereSyntax, params?: ObjectIndexType | undefined): this;
    andWhere(where: ObjectIndexType, params?: ObjectIndexType | undefined): this;
    andWhere(where: ObjectIndexType[], params?: ObjectIndexType | undefined): this;
    andWhere(subQuery: (qb: this) => string, params?: ObjectIndexType | undefined): this;
    andWhere(subQuery: unknown, params?: unknown): this {
        throw new Error('Method not implemented.');
    }

    orWhere(where: string, params?: ObjectIndexType | undefined): this;
    orWhere(where: WhereSyntax, params?: ObjectIndexType | undefined): this;
    orWhere(where: ObjectIndexType, params?: ObjectIndexType | undefined): this;
    orWhere(where: ObjectIndexType[], params?: ObjectIndexType | undefined): this;
    orWhere(subQuery: (qb: this) => string, params?: ObjectIndexType | undefined): this;
    orWhere(subQuery: unknown, params?: unknown): this {
        throw new Error('Method not implemented.');
    }

    whereInIds(ids: any): this {
        throw new Error('Method not implemented.');
    }

    andWhereInIds(ids: any): this {
        throw new Error('Method not implemented.');
    }

    orWhereInIds(ids: any): this {
        throw new Error('Method not implemented.');
    }

    getQueryExecutor() {
        return (
            this.queryExecutor ||
            this.manager.createQueryExecutor(this.manager.defaultReplicationMode())
        );
    }
}
