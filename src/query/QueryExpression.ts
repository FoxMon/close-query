import { Manager } from '../manager/Manager';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { OrderByType } from '../types/OrderByType';
import { AsSyntax } from './AsSyntax';
import { SelectSyntax } from './SelectSyntax';

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

    constructor(connector: Manager) {
        this.connector = connector;

        if (this.connector.options.relationStrategy) {
            this.relationStrategy = this.connector.options.relationStrategy;
        }
    }
}
