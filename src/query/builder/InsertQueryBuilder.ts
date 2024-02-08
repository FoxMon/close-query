/* eslint-disable @typescript-eslint/no-explicit-any */

import { InsertValuesMissingError } from '../../error/InsertValuesMissingError';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { EntityTarget } from '../../types/entity/EntityTarget';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { QueryBuilder } from './QueryBuilder';
import { QueryDeepPartialEntity } from './QueryPartialEntity';

/**
 * `InsertQueryBuilder.ts`
 *
 * Insert에 사용될 query builder를 만들도록 한다.
 */
export class InsertQueryBuilder<Entity extends ObjectIndexType> extends QueryBuilder<Entity> {
    readonly _instance = Symbol.for('InsertQueryBuilder');

    getQuery(): string {
        let sql = this.createComment();

        sql += this.createCteExpression();
        sql += this.createInsertExpression();

        return this.replacePropertyNamesForTheWholeQuery(sql.trim());
    }

    into<T extends ObjectIndexType>(
        entityTarget: EntityTarget<T>,
        columns?: string[],
    ): InsertQueryBuilder<T> {
        /**
         * @TODO 더 해야함
         */

        return this as any as InsertQueryBuilder<T>;
    }

    /**
     * Values needs to be inserted into table.
     */
    values(values: QueryDeepPartialEntity<Entity> | QueryDeepPartialEntity<Entity>[]): this {
        /**
         * @TODO 더 해야함
         */

        return this;
    }

    createInsertExpression() {
        /**
         * @TODO
         */
    }

    getValueSets(): ObjectIndexType[] {
        if (Array.isArray(this.queryExpression.valuesSet)) {
            return this.queryExpression.valuesSet;
        }

        if (ObjectUtil.isObject(this.queryExpression.valuesSet)) {
            return [this.queryExpression.valuesSet];
        }

        throw new InsertValuesMissingError();
    }
}
