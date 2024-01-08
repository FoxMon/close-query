import { Manager } from '../manager/Manager';

/**
 * `RelationDatabaseSchema.ts`
 *
 * 관계형 Database에서 사용될 Schema 관련 로직을 정의 하도록 한다.
 */
export class RelationDatabaseSchema {
    readonly 'instance' = Symbol.for('RelationDatabaseSchema');

    manager: Manager;

    constructor(manager: Manager) {
        this.manager = manager;
    }
}
