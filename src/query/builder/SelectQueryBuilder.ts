import { ObjectIndexType } from '../../types/ObjectIndexType';
import { QueryBuilder } from './QueryBuilder';

/**
 * `SelectQueryBuilder.ts`
 *
 * Select query를 사용하기 위한 Select query builder class를 정의하도록 한다.
 */
export class SelectQueryBuilder<Entity extends ObjectIndexType> extends QueryBuilder<Entity> {
    readonly '_instance' = Symbol.for('SelectQueryBuilder');

    selects: string[] = [];

    getQuery(): string {
        throw new Error('Method not implemented.');
    }
}
