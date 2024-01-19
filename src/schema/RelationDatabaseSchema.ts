import { Manager } from '../manager/Manager';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { DatabaseSchema } from './DatabaseSchema';

/**
 * `RelationDatabaseSchema.ts`
 *
 * 관계형 Database에서 사용될 Schema 관련 로직을 정의 하도록 한다.
 */
export class RelationDatabaseSchema implements DatabaseSchema {
    readonly 'instance' = Symbol.for('RelationDatabaseSchema');

    manager: Manager;

    queryExecutor: QueryExecutor;

    currentDatabase?: string;

    currentSchema?: string;

    constructor(manager: Manager) {
        this.manager = manager;
    }

    async build(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
