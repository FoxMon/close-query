/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { UpsertType } from '../connector/types/UpsertType';
import { CQError } from '../error/CQError';
import { Manager } from '../manager/Manager';
import { CQDataStorage } from '../storage/CQDataStorage';
import { ColumnDataStorage } from '../storage/column/ColumnDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { OrderByType } from '../types/OrderByType';
import { AsSyntax } from './AsSyntax';
import { RelationCountAttribute } from './relation-count/RelationCountAttribute';
import { RelationIdAttribute } from './relation-id/RelationIdLoader';
import { SelectSyntax } from './SelectSyntax';
import { WhereClause } from './WhereClauses';
import { JoinAttribute } from './builder/JoinAttribute';
import { QueryBuilder } from './builder/QueryBuilder';
import { QueryBuilderCteOption } from './builder/QueryBuilderCteOption';
import { SelectQueryBuilderOption } from './builder/SelectQueryBuilderOption';

/**
 * `QueryExpression.ts`
 *
 * Query를 실행할 Object를 만들기 위한 QueryExpression class를 정의하도록 한다.
 */
export class QueryExpression {
    readonly '_instance' = Symbol.for('QueryExpression');

    connector: Manager;

    queryType: 'select' | 'insert' | 'update' | 'delete' | 'relation' | 'soft-delete' | 'restore' =
        'select';

    relationStrategy: 'join' | 'query' = 'join';

    relationIdAttributes: RelationIdAttribute[] = [];

    relationCountAttributes: RelationCountAttribute[] = [];

    cache?: boolean;

    cacheDuration: number;

    cacheId: string;

    lockMode?:
        | 'optimistic'
        | 'pessimistic_read'
        | 'pessimistic_write'
        | 'dirty_read'
        | 'pessimistic_partial_write'
        | 'pessimistic_write_or_fail'
        | 'for_no_key_update'
        | 'for_key_share';

    mainAlias?: AsSyntax;

    selects: SelectSyntax[] = [];

    maxExecutionTime: number = 0;

    selectDistinct: boolean = false;

    selectDistinctOn: string[] = [];

    returning: string | string[];

    extraReturningColumns: ColumnDataStorage[] = [];

    onConflict: string = '';

    onIgnore: boolean = false;

    onUpdate: {
        conflict?: string | string[];
        columns?: string[];
        overwrite?: string[];
        skipUpdateIfNoValuesChanged?: boolean;
        indexPredicate?: string;
        upsertType?: UpsertType;
    };

    subQuery: boolean = false;

    extraAppendedAndWhereCondition: string = '';

    params: ObjectIndexType = {};

    timeTravel?: boolean | string;

    useTransaction: boolean = false;

    callListeners: boolean = true;

    nativeParams: ObjectIndexType = {};

    wheres: WhereClause[] = [];

    limit?: number;

    offset?: number;

    skip?: number;

    take?: number;

    useIndex?: string;

    groupBy: string[] = [];

    orderBy: OrderByType = {};

    asSyntax: AsSyntax;

    asSyntaxes: AsSyntax[] = [];

    valuesSet?: ObjectIndexType | ObjectIndexType[];

    insertColumns: string[] = [];

    disableEscaping: boolean = true;

    comment?: string;

    commonTableExpressions: {
        queryBuilder: QueryBuilder<any> | string;
        alias: string;
        options: QueryBuilderCteOption;
    }[] = [];

    aliasNamePrefixingEnabled: boolean = true;

    joinAttributes: JoinAttribute[] = [];

    withDeleted: boolean = false;

    queryEntity: boolean = false;

    options: SelectQueryBuilderOption[] = [];

    constructor(connector: Manager) {
        this.connector = connector;

        if (this.connector.options.relationStrategy) {
            this.relationStrategy = this.connector.options.relationStrategy;
        }
    }

    get allOrderBys() {
        if (
            !Object.keys(this.orderBy).length &&
            this.mainAlias!.hasDataStorage() &&
            this.options.indexOf('disable-global-order') === -1
        ) {
            const entityOrderBy = (this.mainAlias!.dataStorage as CQDataStorage).orderBy || {};
            return Object.keys(entityOrderBy).reduce((orderBy, key) => {
                orderBy[this.mainAlias!.name + '.' + key] = entityOrderBy[key];
                return orderBy;
            }, {} as OrderByType);
        }

        return this.orderBy;
    }

    createAlias(options: {
        type: 'from' | 'select' | 'join' | 'other';
        name?: string;
        target?: Function | string;
        tablePath?: string;
        subQuery?: string;
        dataStorage?: CQDataStorage;
    }): AsSyntax {
        let asName = options.name;

        if (!asName && options.tablePath) {
            asName = options.tablePath;
        }

        if (!asName && typeof options.target === 'function') {
            asName = options.target.name;
        }

        if (!asName && typeof options.target === 'string') {
            asName = options.target;
        }

        const alias = new AsSyntax();

        alias.type = options.type;

        if (asName) {
            alias.name = asName;
        }

        if (options.dataStorage) {
            alias.dataStorage = options.dataStorage;
        }

        if (options.target && !alias.hasDataStorage()) {
            alias.dataStorage = this.connector.getDataStorage(options.target);
        }

        if (options.tablePath) {
            alias.table = options.tablePath;
        }

        if (options.subQuery) {
            alias.subQuery = options.subQuery;
        }

        this.asSyntaxes.push(alias);

        return alias;
    }

    setMainAlias(alias: AsSyntax): AsSyntax {
        this.mainAlias = alias;

        return alias;
    }

    findAliasByName(aliasName: string): AsSyntax {
        const alias = this.asSyntaxes.find((alias) => alias.name === aliasName);

        if (!alias)
            throw new CQError(`"${aliasName}" alias was not found. Maybe you forgot to join it?`);

        return alias;
    }
}
