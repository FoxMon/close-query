/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectIndexType } from '../../types/ObjectIndexType';
import { EntityTarget } from '../../types/entity/EntityTarget';
import { WhereSyntax } from '../WhereSyntax';
import { JoinAttribute } from './JoinAttribute';
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

    maxExecutionTime(milliseconds: number): this {
        this.queryExpression.maxExecutionTime = milliseconds;

        return this;
    }

    getQuery(): string {
        throw new Error('Method not implemented.');
    }

    subQuery() {
        const queryBuilder = this.createQueryBuilder();

        queryBuilder.queryExpression.subQuery = true;
        queryBuilder.parentQueryBuilder = this;

        return queryBuilder;
    }

    join(
        direction: 'INNER' | 'LEFT',
        entityOrProperty:
            | Function
            | string
            | ((qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>),
        aliasName: string,
        condition?: string,
        params?: ObjectIndexType,
        mapToProperty?: string,
        isMappingMany?: boolean,
        mapAsEntity?: Function | string,
    ): void {
        if (params) {
            this.setParams(params);
        }

        const joinAttribute = new JoinAttribute(this.manager, this.queryExpression);
        joinAttribute.direction = direction;
        joinAttribute.mapAsEntity = mapAsEntity;
        joinAttribute.mapToProperty = mapToProperty;
        joinAttribute.isMappingMany = isMappingMany;
        joinAttribute.entityOrProperty = entityOrProperty;
        joinAttribute.condition = condition;
        this.queryExpression.joinAttributes.push(joinAttribute);

        const joinAttributeDataStorage = joinAttribute.dataStorage;

        if (joinAttributeDataStorage) {
            if (joinAttributeDataStorage.deleteDateColumn && !this.queryExpression.withDeleted) {
                const conditionDeleteColumn = `${aliasName}.${joinAttributeDataStorage.deleteDateColumn.propertyName} IS NULL`;
                joinAttribute.condition = joinAttribute.condition
                    ? ` ${joinAttribute.condition} AND ${conditionDeleteColumn}`
                    : `${conditionDeleteColumn}`;
            }

            joinAttribute.alias = this.queryExpression.createAlias({
                type: 'join',
                name: aliasName,
                dataStorage: joinAttributeDataStorage,
            });

            if (joinAttribute.relation && joinAttribute.relation.junctionDataStorage) {
                this.queryExpression.createAlias({
                    type: 'join',
                    name: joinAttribute.junctionAlias,
                    dataStorage: joinAttribute.relation.junctionDataStorage,
                });
            }
        } else {
            let subQuery: string = '';

            if (typeof entityOrProperty === 'function') {
                const subQueryBuilder: SelectQueryBuilder<any> = (entityOrProperty as any)(
                    (this as any as SelectQueryBuilder<any>).subQuery(),
                );

                this.setParams(subQueryBuilder.getParams());

                subQuery = subQueryBuilder.getQuery();
            } else {
                subQuery = entityOrProperty;
            }

            const isSubQuery =
                typeof entityOrProperty === 'function' ||
                (entityOrProperty.substr(0, 1) === '(' && entityOrProperty.substr(-1) === ')');

            joinAttribute.alias = this.queryExpression.createAlias({
                type: 'join',
                name: aliasName,
                tablePath: isSubQuery === false ? (entityOrProperty as string) : undefined,
                subQuery: isSubQuery === true ? subQuery : undefined,
            });
        }
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

    distinct(distinct: boolean = false): this {
        this.queryExpression.selectDistinct = distinct;

        return this;
    }

    distinctOn(distinctOn: string[]): this {
        this.queryExpression.selectDistinctOn = distinctOn;

        return this;
    }

    from<T extends ObjectIndexType>(
        entityTarget: (queryBuilder: SelectQueryBuilder<any>) => SelectQueryBuilder<any>,
        aliasName: string,
    ): SelectQueryBuilder<T>;
    from<T extends ObjectIndexType>(
        entityTarget: EntityTarget<T>,
        aliasName: string,
    ): SelectQueryBuilder<T>;
    from<T extends ObjectIndexType>(
        entityTarget:
            | EntityTarget<T>
            | ((queryBuilder: SelectQueryBuilder<any>) => SelectQueryBuilder<any>),
        aliasName: string,
    ): SelectQueryBuilder<T> {
        const mainAlias = this.createFromAlias(entityTarget, aliasName);

        this.queryExpression.setMainAlias(mainAlias);

        return this as any as SelectQueryBuilder<T>;
    }

    innerJoin(
        subQueryFactory: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>,
        alias: string,
        condition?: string,
        params?: ObjectIndexType,
    ): this;
    innerJoin(property: string, alias: string, condition?: string, params?: ObjectIndexType): this;
    innerJoin(
        entity: Function | string,
        alias: string,
        condition?: string,
        params?: ObjectIndexType,
    ): this;
    innerJoin(tableName: string, alias: string, condition?: string, params?: ObjectIndexType): this;
    innerJoin(
        entityOrProperty:
            | Function
            | string
            | ((qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>),
        alias: string,
        condition?: string,
        params?: ObjectIndexType,
    ): this {
        this.join('INNER', entityOrProperty, alias, condition, params);

        return this;
    }

    leftJoin(
        subQueryFactory: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>,
        alias: string,
        condition?: string,
        params?: ObjectIndexType,
    ): this;
    leftJoin(property: string, alias: string, condition?: string, params?: ObjectIndexType): this;
    leftJoin(
        entity: Function | string,
        alias: string,
        condition?: string,
        params?: ObjectIndexType,
    ): this;
    leftJoin(tableName: string, alias: string, condition?: string, params?: ObjectIndexType): this;
    leftJoin(
        entityOrProperty:
            | Function
            | string
            | ((qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>),
        alias: string,
        condition?: string,
        params?: ObjectIndexType,
    ): this {
        this.join('LEFT', entityOrProperty, alias, condition, params);

        return this;
    }

    where(w: string, params?: ObjectIndexType | undefined): this;
    where(w: WhereSyntax, params?: ObjectIndexType | undefined): this;
    where(where: ObjectIndexType, params?: ObjectIndexType | undefined): this;
    where(where: ObjectIndexType[], params?: ObjectIndexType | undefined): this;
    where(subQuery: (qb: this) => string, params?: ObjectIndexType | undefined): this;
    where(
        where: WhereSyntax | string | ((qb: this) => string) | ObjectIndexType | ObjectIndexType[],
        params?: unknown,
    ): this {
        this.queryExpression.wheres = [];

        const condition = this.getWhereCondition(where);

        if (condition) {
            this.queryExpression.wheres = [{ type: 'simple', condition: condition }];
        }

        if (params) {
            this.setParams(params);
        }
        return this;
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
