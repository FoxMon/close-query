/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReturningType } from '../../connector/types/ReturningType';
import { CQError } from '../../error/CQError';
import { PropertyNotFoundError } from '../../error/PropertyNotFoundError';
import { FindOperator } from '../../finder/FindOperation';
import { In } from '../../finder/In';
import { Manager } from '../../manager/Manager';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { ColumnDataStorage } from '../../storage/column/ColumnDataStorage';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { EntityTarget } from '../../types/entity/EntityTarget';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { StringUtil } from '../../utils/StringUtil';
import { AsSyntax } from '../AsSyntax';
import { NotWhereSyntax } from '../NotWhereSyntax';
import { QueryExpression } from '../QueryExpression';
import { WhereClause, WhereClauseCondition } from '../WhereClauses';
import { WhereSyntax } from '../WhereSyntax';
import { QueryExecutor } from '../executor/QueryExecutor';
import { DeleteQueryBuilder } from './DeleteQueryBuilder';
import { InsertQueryBuilder } from './InsertQueryBuilder';
import { QueryBuilderCteOption } from './QueryBuilderCteOption';
import { SelectQueryBuilder } from './SelectQueryBuilder';

/**
 * `QueryBuilder.ts`
 *
 * Query를 수행하는 Class를 정의한다.
 */
export abstract class QueryBuilder<Entity extends ObjectIndexType> {
    readonly '_instance' = Symbol.for('QueryBuilder');

    readonly manager: Manager;

    readonly queryExpression: QueryExpression;

    static queryBuilderRegistry: Record<string, any> = {};

    parentQueryBuilder: QueryBuilder<any>;

    queryExecutor: QueryExecutor;

    private parameterIndex = 0;

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

    static registerQueryBuilder(name: string, factory: any) {
        QueryBuilder.queryBuilderRegistry[name] = factory;
    }

    abstract getQuery(): string;

    get asSyntax(): string {
        if (!this.queryExpression.mainAlias) {
            throw new CQError('Main alias is not set');
        }

        return this.queryExpression.mainAlias.name;
    }

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

    setQueryExecutor(queryExecutor: QueryExecutor): this {
        this.queryExecutor = queryExecutor;

        return this;
    }

    callListeners(enabled: boolean): this {
        this.queryExpression.callListeners = enabled;

        return this;
    }

    useTransaction(enabled: boolean): this {
        this.queryExpression.useTransaction = enabled;

        return this;
    }

    addCommonTableExpression(
        queryBuilder: QueryBuilder<any> | string,
        alias: string,
        options?: QueryBuilderCteOption,
    ): this {
        this.queryExpression.commonTableExpressions.push({
            queryBuilder,
            alias,
            options: options || {},
        });

        return this;
    }

    createQueryBuilder() {
        return new (this.manager as any)(this.manager, this.queryExecutor);
    }

    createFromAlias(
        entityTarget:
            | EntityTarget<any>
            | ((queryBuilder: SelectQueryBuilder<any>) => SelectQueryBuilder<any>),
        aliasName?: string,
    ): AsSyntax {
        if (this.manager.hasDataStoraget(entityTarget)) {
            const metadata = this.manager.getDataStorage(entityTarget);

            return this.queryExpression.createAlias({
                type: 'from',
                name: aliasName,
                dataStorage: this.manager.getDataStorage(entityTarget),
                tablePath: metadata.tablePath,
            });
        } else {
            if (typeof entityTarget === 'string') {
                const isSubquery =
                    entityTarget.substring(0, 1) === '(' && entityTarget.substring(-1) === ')';

                return this.queryExpression.createAlias({
                    type: 'from',
                    name: aliasName,
                    tablePath: !isSubquery ? (entityTarget as string) : undefined,
                    subQuery: isSubquery ? entityTarget : undefined,
                });
            }

            const subQueryBuilder: SelectQueryBuilder<any> = (entityTarget as any)(
                (this as any as SelectQueryBuilder<any>).subQuery(),
            );

            this.setParams(subQueryBuilder.getParams());

            const subquery = subQueryBuilder.getQuery();

            return this.queryExpression.createAlias({
                type: 'from',
                name: aliasName,
                subQuery: subquery,
            });
        }
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

            if (cqDataStorage.discriminatorColumn && cqDataStorage.parentCQDataStorage) {
                const values = cqDataStorage.childCQDataStorages
                    .filter((childMetadata) => childMetadata.discriminatorColumn)
                    .map((childMetadata) => childMetadata.discriminatorValue);

                values.push(cqDataStorage.discriminatorValue);
                parameters['discriminatorColumnValues'] = values;
            }
        }

        return parameters;
    }

    getTableName(tablePath: string): string {
        return tablePath
            .split('.')
            .map((i) => {
                if (i === '') {
                    return i;
                }

                return this.escape(i);
            })
            .join('.');
    }

    getMainTableName(): string {
        if (!this.queryExpression.mainAlias) {
            throw new CQError(
                `Entity where values should be inserted is not specified. Call "qb.into(entity)" method to specify it.`,
            );
        }

        if (this.queryExpression.mainAlias.hasDataStorage()) {
            return (this.queryExpression.mainAlias.dataStorage as CQDataStorage).tablePath;
        }

        return this.queryExpression.mainAlias.table!;
    }

    getWhereCondition(
        where:
            | string
            | ((qb: this) => string)
            | WhereSyntax
            | NotWhereSyntax
            | ObjectIndexType
            | ObjectIndexType[],
    ): WhereClauseCondition {
        if (typeof where === 'string') {
            return where;
        }

        if (CheckerUtil.checkIsWhereSyntax(where)) {
            const whereQueryBuilder = this.createQueryBuilder();

            whereQueryBuilder.parentQueryBuilder = this;
            whereQueryBuilder.expressionMap.mainAlias = this.queryExpression.mainAlias;
            whereQueryBuilder.expressionMap.aliasNamePrefixingEnabled =
                this.queryExpression.aliasNamePrefixingEnabled;
            whereQueryBuilder.expressionMap.parameters = this.queryExpression.params;
            whereQueryBuilder.expressionMap.nativeParameters = this.queryExpression.nativeParams;

            whereQueryBuilder.expressionMap.wheres = [];

            where.where(whereQueryBuilder as any);

            return {
                operator: CheckerUtil.checkIsNotWhereSyntax(where) ? 'not' : 'brackets',
                condition: whereQueryBuilder.expressionMap.wheres,
            };
        }

        if (typeof where === 'function') {
            return where(this);
        }

        const wheres: ObjectIndexType[] = Array.isArray(where) ? where : [where];
        const clauses: WhereClause[] = [];

        for (const where of wheres) {
            const conditions: WhereClauseCondition = [];

            for (const [aliasPath, parameterValue] of this.getPredicates(where)) {
                conditions.push({
                    type: 'and',
                    condition: this.getWherePredicateCondition(aliasPath, parameterValue),
                });
            }

            clauses.push({ type: 'or', condition: conditions });
        }

        if (clauses.length === 1) {
            return clauses[0].condition;
        }

        return clauses;
    }

    createPropertyPath(dataStorage: CQDataStorage, entity: ObjectIndexType, prefix: string = '') {
        const paths: string[] = [];

        for (const key of Object.keys(entity)) {
            const path = prefix ? `${prefix}.${key}` : key;

            if (
                entity[key] === null ||
                typeof entity[key] !== 'object' ||
                CheckerUtil.checkIsFindOperator(entity[key])
            ) {
                paths.push(path);
                continue;
            }

            if (dataStorage.hasEmbeddedWithPropertyPath(path)) {
                const subPaths = this.createPropertyPath(dataStorage, entity[key], path);
                paths.push(...subPaths);
                continue;
            }

            if (dataStorage.hasRelationWithPropertyPath(path)) {
                const relation = dataStorage.findRelationWithPropertyPath(path)!;

                if (
                    relation.relationType === 'one-to-one' ||
                    relation.relationType === 'many-to-one'
                ) {
                    const joinColumns = relation.joinColumns
                        .map((j) => j.referencedColumn)
                        .filter((j): j is ColumnDataStorage => !!j);

                    const hasAllJoinColumns =
                        joinColumns.length > 0 &&
                        joinColumns.every((column) => column.getEntityValue(entity[key], false));

                    if (hasAllJoinColumns) {
                        paths.push(path);
                        continue;
                    }
                }

                if (
                    relation.relationType === 'one-to-many' ||
                    relation.relationType === 'many-to-many'
                ) {
                    throw new Error(
                        `Cannot query across ${relation.relationType} for property ${path}`,
                    );
                }

                const primaryColumns = relation.inverseEntityMetadata.primaryColumns;
                const hasAllPrimaryKeys =
                    primaryColumns.length > 0 &&
                    primaryColumns.every((column) => column.getEntityValue(entity[key], false));

                if (hasAllPrimaryKeys) {
                    const subPaths = primaryColumns.map(
                        (column) => `${path}.${column.propertyPath}`,
                    );
                    paths.push(...subPaths);
                    continue;
                }

                const subPaths = this.createPropertyPath(
                    relation.inverseEntityMetadata,
                    entity[key],
                ).map((p) => `${path}.${p}`);
                paths.push(...subPaths);
                continue;
            }

            paths.push(path);
        }

        return paths;
    }

    obtainQueryExecutor() {
        return this.queryExecutor || this.manager.createQueryExecutor();
    }

    hasCommonTableExpression() {
        return this.queryExpression.commonTableExpressions.length > 0;
    }

    *getPredicates(where: ObjectIndexType) {
        if (this.queryExpression.mainAlias!.hasDataStorage()) {
            const propertyPaths = this.createPropertyPath(
                this.queryExpression.mainAlias!.dataStorage as CQDataStorage,
                where,
            );

            for (const propertyPath of propertyPaths) {
                const [alias, aliasPropertyPath, columns] =
                    this.findColumnsForPropertyPath(propertyPath);

                for (const column of columns) {
                    let containedWhere = where;

                    for (const part of aliasPropertyPath) {
                        if (!containedWhere || !(part in containedWhere)) {
                            containedWhere = {};
                            break;
                        }

                        containedWhere = containedWhere[part];
                    }

                    // Use the correct alias & the property path from the column
                    const aliasPath = this.queryExpression.aliasNamePrefixingEnabled
                        ? `${alias.name}.${column.propertyPath}`
                        : column.propertyPath;

                    const parameterValue = column.getEntityValue(containedWhere, true);

                    yield [aliasPath, parameterValue];
                }
            }
        } else {
            for (const key of Object.keys(where)) {
                const parameterValue = where[key];
                const aliasPath = this.queryExpression.aliasNamePrefixingEnabled
                    ? `${this.queryExpression.asSyntax.name}.${key}`
                    : key;

                yield [aliasPath, parameterValue];
            }
        }
    }

    getReturningColumns(): ColumnDataStorage[] {
        const columns: ColumnDataStorage[] = [];

        if (Array.isArray(this.queryExpression.returning)) {
            (this.queryExpression.returning as string[]).forEach((columnName) => {
                if (this.queryExpression.mainAlias!.hasDataStorage()) {
                    columns.push(
                        ...(
                            this.queryExpression.mainAlias!.dataStorage as CQDataStorage
                        ).findColumnsWithPropertyPath(columnName),
                    );
                }
            });
        }
        return columns;
    }

    createTimeTravelQuery(): string {
        if (this.queryExpression.queryType === 'select' && this.queryExpression.timeTravel) {
            return ` AS OF SYSTEM TIME ${this.queryExpression.timeTravel}`;
        }

        return '';
    }

    createWhereExpression() {
        const conditionsArray = [];

        const whereExpression = this.createWhereClausesExpression(this.queryExpression.wheres);

        if (whereExpression.length > 0 && whereExpression !== '1=1') {
            conditionsArray.push(whereExpression);
        }

        if (this.queryExpression.mainAlias!.hasDataStorage()) {
            const dataStorage = this.queryExpression.mainAlias!.dataStorage as CQDataStorage;

            if (
                this.queryExpression.queryType === 'select' &&
                !this.queryExpression.withDeleted &&
                dataStorage.deleteDateColumn
            ) {
                const column = this.queryExpression.aliasNamePrefixingEnabled
                    ? this.queryExpression.mainAlias!.name +
                      '.' +
                      dataStorage.deleteDateColumn.propertyName
                    : dataStorage.deleteDateColumn.propertyName;

                const condition = `${column} IS NULL`;

                conditionsArray.push(condition);
            }

            if (dataStorage.discriminatorColumn && dataStorage.parentCQDataStorage) {
                const column = this.queryExpression.aliasNamePrefixingEnabled
                    ? this.queryExpression.mainAlias!.name +
                      '.' +
                      dataStorage.discriminatorColumn.databaseName
                    : dataStorage.discriminatorColumn.databaseName;

                const condition = `${column} IN (:...discriminatorColumnValues)`;

                conditionsArray.push(condition);
            }
        }

        if (this.queryExpression.extraAppendedAndWhereCondition) {
            const condition = this.queryExpression.extraAppendedAndWhereCondition;

            conditionsArray.push(condition);
        }

        let condition = '';

        condition += this.createTimeTravelQuery();

        if (!conditionsArray.length) {
            condition += '';
        } else if (conditionsArray.length === 1) {
            condition += ` WHERE ${conditionsArray[0]}`;
        } else {
            condition += ` WHERE ( ${conditionsArray.join(' ) AND ( ')} )`;
        }

        return condition;
    }

    createReturningExpression(returningType: ReturningType): string {
        const columns = this.getReturningColumns();

        const connector = this.manager.connector;

        if (
            typeof this.queryExpression.returning !== 'string' &&
            this.queryExpression.extraReturningColumns.length > 0 &&
            connector.isReturningSqlSupported(returningType)
        ) {
            columns.push(
                ...this.queryExpression.extraReturningColumns.filter((column) => {
                    return columns.indexOf(column) === -1;
                }),
            );
        }

        if (columns.length) {
            let columnsExpression = columns
                .map((column) => {
                    const name = this.escape(column.databaseName);
                    if (connector.options.type === 'mssql') {
                        if (
                            this.queryExpression.queryType === 'insert' ||
                            this.queryExpression.queryType === 'update' ||
                            this.queryExpression.queryType === 'soft-delete' ||
                            this.queryExpression.queryType === 'restore'
                        ) {
                            return 'INSERTED.' + name;
                        } else {
                            return this.escape(this.getMainTableName()) + '.' + name;
                        }
                    } else {
                        return name;
                    }
                })
                .join(', ');

            if (connector.options.type === 'mssql') {
                if (
                    this.queryExpression.queryType === 'insert' ||
                    this.queryExpression.queryType === 'update'
                ) {
                    columnsExpression += ' INTO @OutputTable';
                }
            }

            return columnsExpression;
        } else if (typeof this.queryExpression.returning === 'string') {
            return this.queryExpression.returning;
        }

        return '';
    }

    createWhereClausesExpression(clauses: WhereClause[]): string {
        return clauses
            .map((clause, index) => {
                const expression = this.createWhereConditionExpression(clause.condition);

                switch (clause.type) {
                    case 'and':
                        return (
                            (index > 0 ? 'AND ' : '') +
                            `${
                                this.manager.connector.options.isolateWhereStatements ? '(' : ''
                            }${expression}${
                                this.manager.connector.options.isolateWhereStatements ? ')' : ''
                            }`
                        );

                    case 'or':
                        return (
                            (index > 0 ? 'OR ' : '') +
                            `${
                                this.manager.connector.options.isolateWhereStatements ? '(' : ''
                            }${expression}${
                                this.manager.connector.options.isolateWhereStatements ? ')' : ''
                            }`
                        );
                }

                return expression;
            })
            .join(' ')
            .trim();
    }

    createWhereConditionExpression(
        condition: WhereClauseCondition,
        alwaysWrap: boolean = false,
    ): string {
        if (typeof condition === 'string') {
            return condition;
        }

        if (Array.isArray(condition)) {
            if (condition.length === 0) {
                return '1=1';
            }

            if (condition.length === 1 && !alwaysWrap) {
                return this.createWhereClausesExpression(condition);
            }

            return '(' + this.createWhereClausesExpression(condition) + ')';
        }

        const { connector } = this.manager;

        switch (condition.operator) {
            case 'lessThan':
                return `${condition.parameters[0]} < ${condition.parameters[1]}`;

            case 'lessThanOrEqual':
                return `${condition.parameters[0]} <= ${condition.parameters[1]}`;

            case 'arrayContains':
                return `${condition.parameters[0]} @> ${condition.parameters[1]}`;

            case 'jsonContains':
                return `${condition.parameters[0]} ::jsonb @> ${condition.parameters[1]}`;

            case 'arrayContainedBy':
                return `${condition.parameters[0]} <@ ${condition.parameters[1]}`;

            case 'arrayOverlap':
                return `${condition.parameters[0]} && ${condition.parameters[1]}`;

            case 'moreThan':
                return `${condition.parameters[0]} > ${condition.parameters[1]}`;

            case 'moreThanOrEqual':
                return `${condition.parameters[0]} >= ${condition.parameters[1]}`;

            case 'notEqual':
                return `${condition.parameters[0]} != ${condition.parameters[1]}`;

            case 'equal':
                return `${condition.parameters[0]} = ${condition.parameters[1]}`;

            case 'ilike':
                if (connector.options.type === 'postgres') {
                    return `${condition.parameters[0]} ILIKE ${condition.parameters[1]}`;
                }

                return `UPPER(${condition.parameters[0]}) LIKE UPPER(${condition.parameters[1]})`;

            case 'like':
                return `${condition.parameters[0]} LIKE ${condition.parameters[1]}`;

            case 'between':
                return `${condition.parameters[0]} BETWEEN ${condition.parameters[1]} AND ${condition.parameters[2]}`;

            case 'in':
                if (condition.parameters.length <= 1) {
                    return '0=1';
                }

                return `${condition.parameters[0]} IN (${condition.parameters
                    .slice(1)
                    .join(', ')})`;

            case 'any':
                return `${condition.parameters[0]} = ANY(${condition.parameters[1]})`;

            case 'isNull':
                return `${condition.parameters[0]} IS NULL`;

            case 'not':
                return `NOT(${this.createWhereConditionExpression(condition.condition)})`;

            case 'brackets':
                return `${this.createWhereConditionExpression(condition.condition, true)}`;

            case 'and':
                return condition.parameters.join(' AND ');

            case 'or':
                return condition.parameters.join(' OR ');
        }
    }

    getWherePredicateCondition(aliasPath: string, parameterValue: any): WhereClauseCondition {
        if (CheckerUtil.checkIsFindOperator(parameterValue)) {
            const parameters: any[] = [];

            if (parameterValue.useParameter) {
                if (parameterValue.objectLiteralParameters) {
                    this.setParams(parameterValue.objectLiteralParameters);
                } else if (parameterValue.multipleParameters) {
                    for (const v of parameterValue.value) {
                        parameters.push(this.createParameter(v));
                    }
                } else {
                    parameters.push(this.createParameter(parameterValue.value));
                }
            }

            if (parameterValue.type === 'raw') {
                if (parameterValue.getSql) {
                    return parameterValue.getSql(aliasPath);
                } else {
                    return {
                        operator: 'equal',
                        parameters: [aliasPath, parameterValue.value],
                    };
                }
            } else if (parameterValue.type === 'not') {
                if (parameterValue.child) {
                    return {
                        operator: parameterValue.type,
                        condition: this.getWherePredicateCondition(aliasPath, parameterValue.child),
                    };
                } else {
                    return {
                        operator: 'notEqual',
                        parameters: [aliasPath, ...parameters],
                    };
                }
            } else if (parameterValue.type === 'and') {
                const values: FindOperator<any>[] = parameterValue.value;

                return {
                    operator: parameterValue.type,
                    parameters: values.map((operator) =>
                        this.createWhereConditionExpression(
                            this.getWherePredicateCondition(aliasPath, operator),
                        ),
                    ),
                };
            } else if (parameterValue.type === 'or') {
                const values: FindOperator<any>[] = parameterValue.value;

                return {
                    operator: parameterValue.type,
                    parameters: values.map((operator) =>
                        this.createWhereConditionExpression(
                            this.getWherePredicateCondition(aliasPath, operator),
                        ),
                    ),
                };
            } else {
                return {
                    operator: parameterValue.type,
                    parameters: [aliasPath, ...parameters],
                };
            }
        } else {
            return {
                operator: 'equal',
                parameters: [aliasPath, this.createParameter(parameterValue)],
            };
        }
    }

    hasParameter(key: string): boolean {
        return this.parentQueryBuilder?.hasParameter(key) || key in this.queryExpression.params;
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

    createParameter(value: any): string {
        let parameterName;

        do {
            parameterName = `orm_param_${this.parameterIndex++}`;
        } while (this.hasParameter(parameterName));

        this.setParam(parameterName, value);

        return `:${parameterName}`;
    }

    insert(): InsertQueryBuilder<Entity> {
        this.queryExpression.queryType = 'insert';

        if (CheckerUtil.checkIsInsertQueryBuilder(this)) {
            return this as any;
        }

        return QueryBuilder.queryBuilderRegistry['InsertQueryBuilder'](this);
    }

    delete(): DeleteQueryBuilder<Entity> {
        this.queryExpression.queryType = 'delete';

        if (CheckerUtil.checkIsDeleteQueryBuilder(this)) {
            return this as any;
        }

        return QueryBuilder.queryBuilderRegistry['DeleteQueryBuilder'](this);
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

    escape(name: string): string {
        if (!this.queryExpression.disableEscaping) {
            return name;
        }

        return this.manager.connector.escape(name);
    }

    hasCommonTableExpressions(): boolean {
        return this.queryExpression.commonTableExpressions.length > 0;
    }

    createComment(): string {
        if (!this.queryExpression.comment) {
            return '';
        }

        return `/* ${this.queryExpression.comment.replace(/\*\//g, '')} */ `;
    }

    createCteExpression(): string {
        if (!this.hasCommonTableExpressions()) {
            return '';
        }

        const databaseRequireRecusiveHint =
            this.manager.connector.cteCapabilities.requiresRecursiveHint;

        const cteStrings = this.queryExpression.commonTableExpressions.map((cte) => {
            const cteBodyExpression =
                typeof cte.queryBuilder === 'string'
                    ? cte.queryBuilder
                    : cte.queryBuilder.getQuery();

            if (typeof cte.queryBuilder !== 'string') {
                if (cte.queryBuilder.hasCommonTableExpressions()) {
                    throw new CQError(`Nested CTEs aren't supported (CTE: ${cte.alias})`);
                }

                if (
                    !this.manager.connector.cteCapabilities.writable &&
                    !CheckerUtil.checkIsSelectQueryBuilder(cte.queryBuilder)
                ) {
                    throw new CQError(
                        `Only select queries are supported in CTEs in ${this.manager.connector.options.type} (CTE: ${cte.alias})`,
                    );
                }

                this.setParams(cte.queryBuilder.getParams());
            }

            let cteHeader = this.escape(cte.alias);

            if (cte.options.columnNames) {
                const escapedColumnNames = cte.options.columnNames.map((column) =>
                    this.escape(column),
                );

                if (CheckerUtil.checkIsSelectQueryBuilder(cte.queryBuilder)) {
                    if (
                        cte.queryBuilder.queryExpression.selects.length &&
                        cte.options.columnNames.length !==
                            cte.queryBuilder.queryExpression.selects.length
                    ) {
                        throw new CQError(
                            `cte.options.columnNames length (${cte.options.columnNames.length}) doesn't match subquery select list length ${cte.queryBuilder.queryExpression.selects.length} (CTE: ${cte.alias})`,
                        );
                    }
                }

                cteHeader += `(${escapedColumnNames.join(', ')})`;
            }
            const recursiveClause =
                cte.options.recursive && databaseRequireRecusiveHint ? 'RECURSIVE' : '';
            let materializeClause = '';
            if (
                this.manager.connector.cteCapabilities.materializedHint &&
                cte.options.materialized !== undefined
            ) {
                materializeClause = cte.options.materialized ? 'MATERIALIZED' : 'NOT MATERIALIZED';
            }

            return [recursiveClause, cteHeader, 'AS', materializeClause, `(${cteBodyExpression})`]
                .filter(Boolean)
                .join(' ');
        });

        return 'WITH ' + cteStrings.join(', ') + ' ';
    }

    replacePropertyNamesForTheWholeQuery(statement: string) {
        const replacements: { [key: string]: { [key: string]: string } } = {};

        for (const alias of this.queryExpression.asSyntaxes) {
            if (!alias.hasDataStorage()) {
                continue;
            }

            const replaceAliasNamePrefix =
                this.queryExpression.aliasNamePrefixingEnabled && alias.name
                    ? `${alias.name}.`
                    : '';

            if (!replacements[replaceAliasNamePrefix]) {
                replacements[replaceAliasNamePrefix] = {};
            }

            for (const relation of (alias.dataStorage as CQDataStorage).relations) {
                if (relation.joinColumns.length > 0)
                    replacements[replaceAliasNamePrefix][relation.propertyPath] =
                        relation.joinColumns[0].databaseName;
            }

            for (const relation of (alias.dataStorage as CQDataStorage).relations) {
                const allColumns = [...relation.joinColumns, ...relation.inverseJoinColumns];
                for (const joinColumn of allColumns) {
                    const propertyKey = `${relation.propertyPath}.${
                        joinColumn.referencedColumn!.propertyPath
                    }`;
                    replacements[replaceAliasNamePrefix][propertyKey] = joinColumn.databaseName;
                }
            }

            for (const column of (alias.dataStorage as CQDataStorage).columns) {
                replacements[replaceAliasNamePrefix][column.databaseName] = column.databaseName;
            }

            for (const column of (alias.dataStorage as CQDataStorage).columns) {
                replacements[replaceAliasNamePrefix][column.propertyName] = column.databaseName;
            }

            for (const column of (alias.dataStorage as CQDataStorage).columns) {
                replacements[replaceAliasNamePrefix][column.propertyPath] = column.databaseName;
            }
        }

        const replacementKeys = Object.keys(replacements);
        const replaceAliasNamePrefixes = replacementKeys
            .map((key) => StringUtil.escapeRegExp(key))
            .join('|');

        if (replacementKeys.length > 0) {
            statement = statement.replace(
                new RegExp(
                    `([ =\(]|^.{0})` +
                        `${
                            replaceAliasNamePrefixes ? '(' + replaceAliasNamePrefixes + ')' : ''
                        }([^ =\(\)\,]+)` +
                        `(?=[ =\)\,]|.{0}$)`,
                    'gm',
                ),
                (...matches) => {
                    let match: string, pre: string, p: string;
                    if (replaceAliasNamePrefixes) {
                        match = matches[0];
                        pre = matches[1];
                        p = matches[3];

                        if (replacements[matches[2]][p]) {
                            return `${pre}${this.escape(
                                matches[2].substring(0, matches[2].length - 1),
                            )}.${this.escape(replacements[matches[2]][p])}`;
                        }
                    } else {
                        match = matches[0];
                        pre = matches[1];
                        p = matches[2];

                        if (replacements[''][p]) {
                            return `${pre}${this.escape(replacements[''][p])}`;
                        }
                    }
                    return match;
                },
            );
        }

        return statement;
    }

    findColumnsForPropertyPath(propertyPath: string): [AsSyntax, string[], ColumnDataStorage[]] {
        let alias = this.queryExpression.mainAlias;

        const root: string[] = [];
        const propertyPathParts = propertyPath.split('.');

        while (propertyPathParts.length > 1) {
            const part = propertyPathParts[0];

            if (!alias?.hasDataStorage()) {
                break;
            }

            if ((alias.dataStorage as CQDataStorage).hasEmbeddedWithPropertyPath(part)) {
                propertyPathParts.unshift(
                    `${propertyPathParts.shift()}.${propertyPathParts.shift()}`,
                );
                continue;
            }

            if ((alias.dataStorage as CQDataStorage).hasRelationWithPropertyPath(part)) {
                const joinAttr = this.queryExpression.joinAttributes.find(
                    (joinAttr) => joinAttr.relationPropertyPath === part,
                );

                if (!joinAttr?.alias) {
                    const fullRelationPath = root.length > 0 ? `${root.join('.')}.${part}` : part;
                    throw new Error(`Cannot find alias for relation at ${fullRelationPath}`);
                }

                alias = joinAttr.alias;
                root.push(...part.split('.'));
                propertyPathParts.shift();

                continue;
            }

            break;
        }

        if (!alias) {
            throw new Error(`Cannot find alias for property ${propertyPath}`);
        }

        const aliasPropertyPath = propertyPathParts.join('.');

        const columns = (alias.dataStorage as CQDataStorage).findColumnsWithPropertyPath(
            aliasPropertyPath,
        );

        if (!columns.length) {
            throw new PropertyNotFoundError(propertyPath, alias.dataStorage as CQDataStorage);
        }

        return [alias, root, columns];
    }

    getExistsCondition(subQuery: any): [string, any[]] {
        const query = subQuery
            .clone()
            .orderBy()
            .groupBy()
            .offset(undefined)
            .limit(undefined)
            .skip(undefined)
            .take(undefined)
            .select('1')
            .setOption('disable-global-order');

        return [`EXISTS (${query.getQuery()})`, query.getParameters()];
    }

    getWhereInIdsCondition(ids: any | any[]): ObjectIndexType | WhereSyntax {
        const dataStorage = this.queryExpression.mainAlias!.dataStorage as CQDataStorage;
        const normalized = (Array.isArray(ids) ? ids : [ids]).map((id) =>
            dataStorage.ensureEntityIdMap(id),
        );

        if (!dataStorage.hasMultiplePrimaryKeys) {
            const primaryColumn = dataStorage.primaryColumns[0];

            if (
                !primaryColumn.transformer &&
                !primaryColumn.relationDataStorage &&
                !primaryColumn.embeddedDataStorage
            ) {
                return {
                    [primaryColumn.propertyName]: In(
                        normalized.map((id) => primaryColumn.getEntityValue(id, false)),
                    ),
                };
            }
        }

        return new WhereSyntax((qb) => {
            for (const data of normalized) {
                qb.orWhere(new WhereSyntax((qb) => qb.where(data)));
            }
        });
    }
}
