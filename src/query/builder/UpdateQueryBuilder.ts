/* eslint-disable @typescript-eslint/no-explicit-any */

import { Manager } from '../../manager/Manager';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { WhereSyntax } from '../WhereSyntax';
import { QueryExecutor } from '../executor/QueryExecutor';
import { QueryBuilder } from './QueryBuilder';
import { QueryDeepPartialEntity } from './QueryPartialEntity';
import { WhereExpressionBuilder } from './WhereExpressionBuilder';

/**
 * `UpdateQueryBuilder.ts`
 */
export class UpdateQueryBuilder<Entity extends ObjectIndexType>
    extends QueryBuilder<Entity>
    implements WhereExpressionBuilder
{
    readonly _instance = Symbol.for('UpdateQueryBuilder');

    constructor(
        connectionOrQueryBuilder: Manager | QueryBuilder<any>,
        queryExecutor?: QueryExecutor,
    ) {
        super(connectionOrQueryBuilder as any, queryExecutor);

        this.queryExpression.aliasNamePrefixingEnabled = false;
    }

    getQuery(): string {
        throw new Error('Method not implemented.');
    }

    set(values: QueryDeepPartialEntity<Entity>): this {
        this.queryExpression.valuesSet = values;

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
}
