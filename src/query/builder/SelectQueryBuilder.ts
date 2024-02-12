/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConnectorBuilder } from '../../connector/ConnectorBuilder';
import { CQError } from '../../error/CQError';
import { NoVersionOrUpdateDateColumnError } from '../../error/NoVersionOrUpdateDateColumnError';
import { PessimisticLockTransactionRequiredError } from '../../error/PessimisticLockTransactionRequiredError';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { OrderByType } from '../../types/OrderByType';
import { EntityTarget } from '../../types/entity/EntityTarget';
import { CQUtil } from '../../utils/CQUtil';
import { RelationIdLoader } from '../relation-id/RelationIdLoader';
import { RelationIdLoader as QueryStrategyRelationIdLoader } from './RelationIdLoader';
import { WhereSyntax } from '../WhereSyntax';
import { QueryExecutor } from '../executor/QueryExecutor';
import { JoinAttribute } from './JoinAttribute';
import { QueryBuilder } from './QueryBuilder';
import { WhereExpressionBuilder } from './WhereExpressionBuilder';
import { FindManyOption } from '../../finder/option/FindManyOption';
import { QueryResultCacheOption } from '../../cache/QueryResultCacheOption';
import { RelationCountLoader } from '../relation-count/RelationCountLoader';
import { QueryExpression } from '../QueryExpression';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { RelationIdMetadataToAttributeTransformer } from '../relation-id/RelationIdMetadataToAttributeTransformer';
import { RelationCountMetadataToAttributeTransformer } from '../relation-count/RelationCountMetadataToAttributeTransformer';
import { RelationDataStorage } from '../../storage/RelationDataStorage';
import { RawSqlResultsToEntityTransformer } from '../RawSqlResultsToEntityTransformer';

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

    findOptions: FindManyOption = {};

    selects: string[] = [];

    relationDataStorage: RelationDataStorage[] = [];

    maxExecutionTime(milliseconds: number): this {
        this.queryExpression.maxExecutionTime = milliseconds;

        return this;
    }

    getQuery(): string {
        throw new Error('Method not implemented.');
    }

    async getMany(): Promise<Entity[]> {
        if (this.queryExpression.lockMode === 'optimistic') {
            throw new CQError('The optimistic lock can be used only with getOne() method.');
        }

        const results = await this.getRawAndEntities();

        return results.entities;
    }

    async getRawAndEntities<T = any>(): Promise<{
        entities: Entity[];
        raw: T[];
    }> {
        const queryExecutor = this.obtainQueryExecutor();

        let transactionStartedByUs: boolean = false;

        try {
            if (
                this.queryExpression.useTransaction === true &&
                queryExecutor.isTransaction === false
            ) {
                await queryExecutor.startTransaction();
                transactionStartedByUs = true;
            }

            this.queryExpression.queryEntity = true;

            const results = await this.executeEntitiesAndRawResults(queryExecutor);

            if (transactionStartedByUs) {
                await queryExecutor.commitTransaction();
            }

            return results;
        } catch (error) {
            if (transactionStartedByUs) {
                try {
                    await queryExecutor.rollbackTransaction();
                } catch (rollbackError) {
                    //
                }
            }
            throw error;
        } finally {
            if (queryExecutor !== this.queryExecutor) {
                await queryExecutor.release();
            }
        }
    }

    async executeEntitiesAndRawResults(
        queryExecutor: QueryExecutor,
    ): Promise<{ entities: Entity[]; raw: any[] }> {
        if (!this.queryExpression.mainAlias)
            throw new CQError(`Alias is not set. Use "from" method to set an alias.`);

        if (
            (this.queryExpression.lockMode === 'pessimistic_read' ||
                this.queryExpression.lockMode === 'pessimistic_write' ||
                this.queryExpression.lockMode === 'pessimistic_partial_write' ||
                this.queryExpression.lockMode === 'pessimistic_write_or_fail' ||
                this.queryExpression.lockMode === 'for_no_key_update' ||
                this.queryExpression.lockMode === 'for_key_share') &&
            !queryExecutor.isTransaction
        ) {
            throw new PessimisticLockTransactionRequiredError();
        }

        if (this.queryExpression.lockMode === 'optimistic') {
            const dataStorage = this.queryExpression.mainAlias.dataStorage as CQDataStorage;

            if (!dataStorage.versionColumn && !dataStorage.updateDateColumn) {
                throw new NoVersionOrUpdateDateColumnError(dataStorage.name);
            }
        }

        const relationIdLoader = new RelationIdLoader(
            this.manager,
            queryExecutor,
            this.queryExpression.relationIdAttributes,
        );
        const relationCountLoader = new RelationCountLoader(
            this.manager,
            queryExecutor,
            this.queryExpression.relationCountAttributes,
        );
        const relationIdMetadataTransformer = new RelationIdMetadataToAttributeTransformer(
            this.queryExpression,
        );

        relationIdMetadataTransformer.transform();

        const relationCountMetadataTransformer = new RelationCountMetadataToAttributeTransformer(
            this.queryExpression,
        );

        relationCountMetadataTransformer.transform();

        let rawResults: any[] = [];
        let entities: any[] = [];

        if (
            (this.queryExpression.skip || this.queryExpression.take) &&
            this.queryExpression.joinAttributes.length > 0
        ) {
            const [selects, orderBys] =
                this.createOrderByCombinedWithSelectExpression('distinctAlias');
            const metadata = this.queryExpression.mainAlias.dataStorage as CQDataStorage;
            const mainAliasName = this.queryExpression.mainAlias.name;

            const querySelects = metadata.primaryColumns.map((primaryColumn) => {
                const distinctAlias = this.escape('distinctAlias');
                const columnAlias = this.escape(
                    ConnectorBuilder.buildAlias(
                        this.manager.connector,
                        undefined,
                        mainAliasName,
                        primaryColumn.databaseName,
                    ),
                );

                if (!orderBys[columnAlias]) {
                    orderBys[columnAlias] = 'ASC';
                }

                const alias = ConnectorBuilder.buildAlias(
                    this.manager.connector,
                    undefined,
                    'ids_' + mainAliasName,
                    primaryColumn.databaseName,
                );

                return `${distinctAlias}.${columnAlias} AS ${this.escape(alias)}`;
            });

            const originalQuery = this.create();
            const originalQueryTimeTravel = originalQuery.queryExpression.timeTravel;

            rawResults = await new SelectQueryBuilder(this.manager, queryExecutor)
                .select(`DISTINCT ${querySelects.join(', ')}`)
                .addSelect(selects)
                .from(
                    `(${originalQuery.orderBy().timeTravelQuery(false).getQuery()})`,
                    'distinctAlias',
                )
                .timeTravelQuery(originalQueryTimeTravel)
                .offset(this.queryExpression.skip)
                .limit(this.queryExpression.take)
                .orderBy(orderBys)
                .cache(
                    this.queryExpression.cache && this.queryExpression.cacheId
                        ? `${this.queryExpression.cacheId}-pagination`
                        : this.queryExpression.cache,
                    this.queryExpression.cacheDuration,
                )
                .setParams(this.getParams())
                .setParams(this.queryExpression.nativeParams)
                .getRawMany();

            if (rawResults.length > 0) {
                let condition = '';

                const parameters: ObjectIndexType = {};

                if (metadata.hasMultiplePrimaryKeys) {
                    condition = rawResults
                        .map((result, index) => {
                            return metadata.primaryColumns
                                .map((primaryColumn) => {
                                    const paramKey = `orm_distinct_ids_${index}_${primaryColumn.databaseName}`;
                                    const paramKeyResult = ConnectorBuilder.buildAlias(
                                        this.manager.connector,
                                        undefined,
                                        'ids_' + mainAliasName,
                                        primaryColumn.databaseName,
                                    );
                                    parameters[paramKey] = result[paramKeyResult];
                                    return `${mainAliasName}.${primaryColumn.propertyPath}=:${paramKey}`;
                                })
                                .join(' AND ');
                        })
                        .join(' OR ');
                } else {
                    const alias = ConnectorBuilder.buildAlias(
                        this.manager.connector,
                        undefined,
                        'ids_' + mainAliasName,
                        metadata.primaryColumns[0].databaseName,
                    );

                    const ids = rawResults.map((result) => result[alias]);
                    const areAllNumbers = ids.every((id: any) => typeof id === 'number');
                    if (areAllNumbers) {
                        condition = `${mainAliasName}.${
                            metadata.primaryColumns[0].propertyPath
                        } IN (${ids.join(', ')})`;
                    } else {
                        parameters['orm_distinct_ids'] = ids;
                        condition =
                            mainAliasName +
                            '.' +
                            metadata.primaryColumns[0].propertyPath +
                            ' IN (:...orm_distinct_ids)';
                    }
                }
                rawResults = await this.create()
                    .mergeExpressionMap({
                        extraAppendedAndWhereCondition: condition,
                    })
                    .setParams(parameters)
                    .loadRawResults(queryExecutor);
            }
        } else {
            rawResults = await this.loadRawResults(queryExecutor);
        }

        if (rawResults.length > 0) {
            // transform raw results into entities
            const rawRelationIdResults = await relationIdLoader.load(rawResults);
            const rawRelationCountResults = await relationCountLoader.load(rawResults);
            const transformer = new RawSqlResultsToEntityTransformer(
                this.queryExpression,
                this.manager,
                rawRelationIdResults,
                rawRelationCountResults,
                this.queryExecutor,
            );

            entities = transformer.transform(rawResults, this.queryExpression.mainAlias!);

            if (
                this.queryExpression.callListeners === true &&
                this.queryExpression.mainAlias.hasDataStorage()
            ) {
                await queryExecutor.eventBroadCaster.broadcast(
                    'Load',
                    this.queryExpression.mainAlias.dataStorage as CQDataStorage,
                    entities,
                );
            }
        }

        if (this.queryExpression.relationStrategy === 'query') {
            const queryStrategyRelationIdLoader = new QueryStrategyRelationIdLoader(
                this.manager,
                queryExecutor,
            );

            await Promise.all(
                this.relationDataStorage.map(async (relation) => {
                    const relationTarget = relation.inverseDataStorage.target;
                    const relationAlias = relation.inverseDataStorage.targetName;

                    const select = Array.isArray(this.findOptions.select)
                        ? CQUtil.propertyPathsToTruthyObject(this.findOptions.select as string[])
                        : this.findOptions.select;
                    const relations = Array.isArray(this.findOptions.relations)
                        ? CQUtil.propertyPathsToTruthyObject(this.findOptions.relations)
                        : this.findOptions.relations;

                    const queryBuilder = this.createQueryBuilder()
                        .select(relationAlias)
                        .from(relationTarget, relationAlias)
                        .setFindOptions({
                            select: select
                                ? CQUtil.deepValue(select, relation.propertyPath)
                                : undefined,
                            order: this.findOptions.order
                                ? CQUtil.deepValue(this.findOptions.order, relation.propertyPath)
                                : undefined,
                            relations: relations
                                ? CQUtil.deepValue(relations, relation.propertyPath)
                                : undefined,
                            withDeleted: this.findOptions.withDeleted,
                            relationLoadStrategy: this.findOptions.relationLoadStrategy,
                        });

                    if (entities.length > 0) {
                        const relatedEntityGroups: any[] =
                            await queryStrategyRelationIdLoader.loadManyToManyRelationIdsAndGroup(
                                relation,
                                entities,
                                undefined,
                                queryBuilder,
                            );

                        entities.forEach((entity) => {
                            const relatedEntityGroup = relatedEntityGroups.find(
                                (group) => group.entity === entity,
                            );

                            if (relatedEntityGroup) {
                                const value =
                                    relatedEntityGroup.related === undefined
                                        ? null
                                        : relatedEntityGroup.related;

                                relation.setEntityValue(entity, value);
                            }
                        });
                    }
                }),
            );
        }

        return {
            raw: rawResults,
            entities: entities,
        };
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

    addSelect(
        selection: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>,
        selectionAliasName?: string,
    ): this;
    addSelect(selection: string, selectionAliasName?: string): this;
    addSelect(selection: string[]): this;
    addSelect(
        selection: string | string[] | ((qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>),
        selectionAliasName?: string,
    ): this {
        if (!selection) {
            return this;
        }

        if (Array.isArray(selection)) {
            this.queryExpression.selects = this.queryExpression.selects.concat(
                selection.map((selection) => ({ select: selection })),
            );
        } else if (typeof selection === 'function') {
            const subQueryBuilder = selection(this.subQuery());

            this.setParams(subQueryBuilder.getParams());
            this.queryExpression.selects.push({
                select: subQueryBuilder.getQuery(),
                aliasName: selectionAliasName,
            });
        } else if (selection) {
            this.queryExpression.selects.push({
                select: selection,
                aliasName: selectionAliasName,
            });
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
    andWhere(
        where: string | WhereSyntax | ((qb: this) => string) | ObjectIndexType | ObjectIndexType[],
        params?: ObjectIndexType,
    ): this {
        this.queryExpression.wheres.push({
            type: 'and',
            condition: this.getWhereCondition(where),
        });

        if (params) {
            this.setParams(params);
        }

        return this;
    }

    orWhere(where: string, params?: ObjectIndexType | undefined): this;
    orWhere(where: WhereSyntax, params?: ObjectIndexType | undefined): this;
    orWhere(where: ObjectIndexType, params?: ObjectIndexType | undefined): this;
    orWhere(where: ObjectIndexType[], params?: ObjectIndexType | undefined): this;
    orWhere(subQuery: (qb: this) => string, params?: ObjectIndexType | undefined): this;
    orWhere(
        where: WhereSyntax | string | ((qb: this) => string) | ObjectIndexType | ObjectIndexType[],
        params?: ObjectIndexType,
    ): this {
        this.queryExpression.wheres.push({
            type: 'or',
            condition: this.getWhereCondition(where),
        });

        if (params) {
            this.setParams(params);
        }

        return this;
    }

    whereInIds(ids: any | any[]): this {
        return this.where(this.getWhereInIdsCondition(ids));
    }

    andWhereInIds(ids: any | any[]): this {
        return this.andWhere(this.getWhereInIdsCondition(ids));
    }

    orWhereInIds(ids: any | any[]): this {
        return this.orWhere(this.getWhereInIdsCondition(ids));
    }

    groupBy(): this;
    groupBy(groupBy: string): this;
    groupBy(groupBy?: string): this {
        if (groupBy) {
            this.queryExpression.groupBy = [groupBy];
        } else {
            this.queryExpression.groupBy = [];
        }

        return this;
    }

    addGroupBy(groupBy: string): this {
        this.queryExpression.groupBy.push(groupBy);
        return this;
    }

    orderBy(): this;
    orderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
    orderBy(order: OrderByType): this;
    orderBy(
        sort?: string | OrderByType,
        order: 'ASC' | 'DESC' = 'ASC',
        nulls?: 'NULLS FIRST' | 'NULLS LAST',
    ): this {
        if (order !== undefined && order !== 'ASC' && order !== 'DESC') {
            throw new CQError(
                `SelectQueryBuilder.addOrderBy "order" can accept only "ASC" and "DESC" values.`,
            );
        }

        if (nulls !== undefined && nulls !== 'NULLS FIRST' && nulls !== 'NULLS LAST') {
            throw new CQError(
                `SelectQueryBuilder.addOrderBy "nulls" can accept only "NULLS FIRST" and "NULLS LAST" values.`,
            );
        }

        if (sort) {
            if (typeof sort === 'object') {
                this.queryExpression.orderBy = sort as OrderByType;
            } else {
                if (nulls) {
                    this.queryExpression.orderBy = {
                        [sort as string]: { order, nulls },
                    };
                } else {
                    this.queryExpression.orderBy = { [sort as string]: order };
                }
            }
        } else {
            this.queryExpression.orderBy = {};
        }

        return this;
    }

    addOrderBy(
        sort: string,
        order: 'ASC' | 'DESC' = 'ASC',
        nulls?: 'NULLS FIRST' | 'NULLS LAST',
    ): this {
        if (order !== undefined && order !== 'ASC' && order !== 'DESC') {
            throw new CQError(
                `SelectQueryBuilder.addOrderBy "order" can accept only "ASC" and "DESC" values.`,
            );
        }

        if (nulls !== undefined && nulls !== 'NULLS FIRST' && nulls !== 'NULLS LAST') {
            throw new CQError(
                `SelectQueryBuilder.addOrderBy "nulls" can accept only "NULLS FIRST" and "NULLS LAST" values.`,
            );
        }

        if (nulls) {
            this.queryExpression.orderBy[sort] = { order, nulls };
        } else {
            this.queryExpression.orderBy[sort] = order;
        }

        return this;
    }

    limit(limit?: number): this {
        this.queryExpression.limit = this.normalizeNumber(limit);

        if (this.queryExpression.limit !== undefined && isNaN(this.queryExpression.limit)) {
            throw new CQError(
                `Provided "limit" value is not a number. Please provide a numeric value.`,
            );
        }

        return this;
    }

    offset(offset?: number): this {
        this.queryExpression.offset = this.normalizeNumber(offset);

        if (this.queryExpression.offset !== undefined && isNaN(this.queryExpression.offset)) {
            throw new CQError(
                `Provided "offset" value is not a number. Please provide a numeric value.`,
            );
        }

        return this;
    }

    cache(enabled: boolean): this;
    cache(milliseconds: number): this;
    cache(id: any, milliseconds?: number): this;
    cache(enabledOrMillisecondsOrId: boolean | number | string, maybeMilliseconds?: number): this {
        if (typeof enabledOrMillisecondsOrId === 'boolean') {
            this.queryExpression.cache = enabledOrMillisecondsOrId;
        } else if (typeof enabledOrMillisecondsOrId === 'number') {
            this.queryExpression.cache = true;
            this.queryExpression.cacheDuration = enabledOrMillisecondsOrId;
        } else if (
            typeof enabledOrMillisecondsOrId === 'string' ||
            typeof enabledOrMillisecondsOrId === 'number'
        ) {
            this.queryExpression.cache = true;
            this.queryExpression.cacheId = enabledOrMillisecondsOrId;
        }

        if (maybeMilliseconds) {
            this.queryExpression.cacheDuration = maybeMilliseconds;
        }

        return this;
    }

    getQueryExecutor() {
        return (
            this.queryExecutor ||
            this.manager.createQueryExecutor(this.manager.defaultReplicationMode())
        );
    }

    timeTravelQuery(_timeTravelFn?: string | boolean): this {
        return this;
    }

    mergeExpressionMap(queryExpression: Partial<QueryExpression>): this {
        ObjectUtil.assign(this.queryExpression, queryExpression);

        return this;
    }

    async getRawOne<T = any>(): Promise<T | undefined> {
        return (await this.getRawMany())[0];
    }

    async getRawMany<T = any>(): Promise<T[]> {
        if (this.queryExpression.lockMode === 'optimistic') {
            throw new CQError('The optimistic lock can be used only with getOne() method.');
        }

        this.queryExpression.queryEntity = false;

        const queryExecutor = this.obtainQueryExecutor();

        let transactionStartedByUs: boolean = false;

        try {
            if (
                this.queryExpression.useTransaction === true &&
                queryExecutor.isTransaction === false
            ) {
                await queryExecutor.startTransaction();
                transactionStartedByUs = true;
            }

            const results = await this.loadRawResults(queryExecutor);

            if (transactionStartedByUs) {
                await queryExecutor.commitTransaction();
            }

            return results;
        } catch (error) {
            if (transactionStartedByUs) {
                try {
                    await queryExecutor.rollbackTransaction();
                } catch (rollbackError) {
                    //
                }
            }
            throw error;
        } finally {
            if (this.queryExecutor !== this.queryExecutor) {
                await queryExecutor.release();
            }
        }
    }

    async loadRawResults(queryExecutor: QueryExecutor) {
        const [sql, parameters] = this.getQueryAndParams();
        const queryId =
            sql +
            ' -- PARAMETERS: ' +
            JSON.stringify(parameters, (_, value) =>
                typeof value === 'bigint' ? value.toString() : value,
            );
        const cacheOptions =
            typeof this.manager.options.cache === 'object' ? this.manager.options.cache : {};
        let savedQueryResultCacheOptions: QueryResultCacheOption | undefined = undefined;
        const isCachingEnabled =
            (cacheOptions.alwaysEnabled && this.queryExpression.cache !== false) ||
            this.queryExpression.cache === true;
        let cacheError = false;

        if (this.manager.queryResultCache && isCachingEnabled) {
            try {
                savedQueryResultCacheOptions = await this.manager.queryResultCache.getFromCache(
                    {
                        identifier: this.queryExpression.cacheId,
                        query: queryId,
                        duration:
                            this.queryExpression.cacheDuration || cacheOptions.duration || 1000,
                    },
                    queryExecutor,
                );
                if (
                    savedQueryResultCacheOptions &&
                    !this.manager.queryResultCache.isExpired(savedQueryResultCacheOptions)
                ) {
                    return JSON.parse(savedQueryResultCacheOptions.result);
                }
            } catch (error) {
                if (!cacheOptions.ignoreErrors) {
                    throw error;
                }

                cacheError = true;
            }
        }

        const results = await queryExecutor.query(sql, parameters, true);

        if (!cacheError && this.manager.queryResultCache && isCachingEnabled) {
            try {
                await this.manager.queryResultCache.storeInCache(
                    {
                        identifier: this.queryExpression.cacheId,
                        query: queryId,
                        time: new Date().getTime(),
                        duration:
                            this.queryExpression.cacheDuration || cacheOptions.duration || 1000,
                        result: JSON.stringify(results.records),
                    },
                    savedQueryResultCacheOptions,
                    queryExecutor,
                );
            } catch (error) {
                if (!cacheOptions.ignoreErrors) {
                    throw error;
                }
            }
        }

        return results.records;
    }

    createOrderByCombinedWithSelectExpression(parentAlias: string): [string, OrderByType] {
        const orderBys = this.queryExpression.allOrderBys;
        const selectString = Object.keys(orderBys)
            .map((orderCriteria) => {
                if (orderCriteria.indexOf('.') !== -1) {
                    const criteriaParts = orderCriteria.split('.');
                    const aliasName = criteriaParts[0];
                    const propertyPath = criteriaParts.slice(1).join('.');
                    const alias = this.queryExpression.findAliasByName(aliasName);
                    const column = (alias.dataStorage as CQDataStorage).findColumnWithPropertyPath(
                        propertyPath,
                    );
                    return (
                        this.escape(parentAlias) +
                        '.' +
                        this.escape(
                            ConnectorBuilder.buildAlias(
                                this.manager.connector,
                                undefined,
                                aliasName,
                                column!.databaseName,
                            ),
                        )
                    );
                } else {
                    if (
                        this.queryExpression.selects.find(
                            (select) =>
                                select.select === orderCriteria ||
                                select.aliasName === orderCriteria,
                        )
                    )
                        return this.escape(parentAlias) + '.' + this.escape(orderCriteria);

                    return '';
                }
            })
            .join(', ');

        const orderByObject: OrderByType = {};

        Object.keys(orderBys).forEach((orderCriteria) => {
            if (orderCriteria.indexOf('.') !== -1) {
                const criteriaParts = orderCriteria.split('.');
                const aliasName = criteriaParts[0];
                const propertyPath = criteriaParts.slice(1).join('.');
                const alias = this.queryExpression.findAliasByName(aliasName);
                const column = (alias.dataStorage as CQDataStorage).findColumnWithPropertyPath(
                    propertyPath,
                );
                orderByObject[
                    this.escape(parentAlias) +
                        '.' +
                        this.escape(
                            ConnectorBuilder.buildAlias(
                                this.manager.connector,
                                undefined,
                                aliasName,
                                column!.databaseName,
                            ),
                        )
                ] = orderBys[orderCriteria];
            } else {
                if (
                    this.queryExpression.selects.find(
                        (select) =>
                            select.select === orderCriteria || select.aliasName === orderCriteria,
                    )
                ) {
                    orderByObject[this.escape(parentAlias) + '.' + this.escape(orderCriteria)] =
                        orderBys[orderCriteria];
                } else {
                    orderByObject[orderCriteria] = orderBys[orderCriteria];
                }
            }
        });

        return [selectString, orderByObject];
    }

    normalizeNumber(num: any) {
        if (typeof num === 'number' || num === undefined || num === null) {
            return num;
        }

        return Number(num);
    }
}
