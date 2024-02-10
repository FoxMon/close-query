/* eslint-disable @typescript-eslint/no-explicit-any */

import { DeleteQueryBuilder } from './builder/DeleteQueryBuilder';
import { InsertQueryBuilder } from './builder/InsertQueryBuilder';
import { QueryBuilder } from './builder/QueryBuilder';
import { SelectQueryBuilder } from './builder/SelectQueryBuilder';

/**
 * `registQueryBuilder.ts`
 *
 * QueryBuilder를 등록할 수 있도록 한다.
 */

export function registerQueryBuilder() {
    /**
     * Regist `SelectQueryBuilder`
     *
     * `SelectQueryBuilder`를 주입하도록 한다.
     */
    QueryBuilder.registerQueryBuilder(
        'SelectQueryBuilder',
        (queryBuilder: QueryBuilder<any>) => new SelectQueryBuilder(queryBuilder),
    );

    /**
     * Regist `InsertQueryBuilder`
     *
     * `InsertQueryBuilder`를 주입하도록 한다.
     */
    QueryBuilder.registerQueryBuilder(
        'InsertQueryBuilder',
        (queryBuilder: QueryBuilder<any>) => new InsertQueryBuilder(queryBuilder),
    );

    /**
     * Regist `DeleteQueryBuilder`
     *
     * `DeleteQueryBuilder`를 주입하도록 한다.
     */
    QueryBuilder.registerQueryBuilder(
        'DeleteQueryBuilder',
        (queryBuilder: QueryBuilder<any>) => new DeleteQueryBuilder(queryBuilder),
    );
}
