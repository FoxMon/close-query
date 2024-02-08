/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../manager/Manager';
import { CQDataStorage } from '../storage/CQDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { OrderByType } from '../types/OrderByType';
import { AsSyntax } from './AsSyntax';
import { SelectSyntax } from './SelectSyntax';
import { QueryBuilder } from './builder/QueryBuilder';
import { QueryBuilderCteOption } from './builder/QueryBuilderCteOption';

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

    mainAlias?: AsSyntax;

    selects: SelectSyntax[] = [];

    subQuery: boolean = false;

    params: ObjectIndexType = {};

    nativeParams: ObjectIndexType = {};

    selectDistinct: boolean = false;

    limit?: number;

    offset?: number;

    skip?: number;

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

    constructor(connector: Manager) {
        this.connector = connector;

        if (this.connector.options.relationStrategy) {
            this.relationStrategy = this.connector.options.relationStrategy;
        }
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
}
