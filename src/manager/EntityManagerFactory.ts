import { QueryExecutor } from '../query/executor/QueryExecutor';
import { EntityManager } from './EntityManager';
import { Manager } from './Manager';

/**
 * `EntityManagerFactory.ts`
 *
 * EntityManager를 load해주는 Factory를 정의한다.
 */
export class EntityManagerFactory {
    readonly '_instance' = Symbol.for('EntityManagerFactory');

    create(manager: Manager, queryExecutor?: QueryExecutor) {
        /**
         * @TODO 지원하지 않는 DB타입 예외처리
         */

        return new EntityManager(manager, queryExecutor);
    }
}
