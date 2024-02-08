/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from '../../error/CQError';
import { Manager } from '../../manager/Manager';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { EntityTarget } from '../../types/entity/EntityTarget';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { StringUtil } from '../../utils/StringUtil';
import { AsSyntax } from '../AsSyntax';
import { QueryExpression } from '../QueryExpression';
import { QueryExecutor } from '../executor/QueryExecutor';
import { DeleteQueryBuilder } from './DeleteQueryBuilder';
import { InsertQueryBuilder } from './InsertQueryBuilder';
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
                    // Avoid a lookbehind here since it's not well supported
                    `([ =\(]|^.{0})` + // any of ' =(' or start of line
                        // followed by our prefix, e.g. 'tablename.' or ''
                        `${
                            replaceAliasNamePrefixes ? '(' + replaceAliasNamePrefixes + ')' : ''
                        }([^ =\(\)\,]+)` + // a possible property name: sequence of anything but ' =(),'
                        // terminated by ' =),' or end of line
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
}
