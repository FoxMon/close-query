/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectIndexType } from '../../types/ObjectIndexType';
import { WhereSyntax } from '../WhereSyntax';
import { QueryBuilder } from './QueryBuilder';

/**
 * `DeleteQueryBuilder.ts`
 *
 * Delete query에서 사용될 query builder를 만들도록 한다.
 */
export class DeleteQueryBuilder<Entity extends ObjectIndexType> extends QueryBuilder<Entity> {
    readonly _instance = Symbol.for('DeleteQueryBuilder');

    getQuery(): string {
        throw new Error('Method not implemented.');
    }

    from<T extends ObjectIndexType>(arg0: string): DeleteQueryBuilder<T> {
        /**
         * @TODO 더 해야함
         */

        return this as any as DeleteQueryBuilder<T>;
    }

    where(
        where: WhereSyntax | string | ((qb: this) => string) | ObjectIndexType | ObjectIndexType[],
        params?: ObjectIndexType,
    ): this {
        /**
         * @TODO 더 해야함
         */

        return this;
    }

    andWhere(
        where: WhereSyntax | string | ((qb: this) => string) | ObjectIndexType | ObjectIndexType[],
        params?: ObjectIndexType,
    ): this {
        /**
         * @TODO 더 해야함
         */

        return this;
    }
}
