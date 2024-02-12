import { Manager } from '../manager/Manager';
import { QueryExecutor } from './executor/QueryExecutor';

/**
 * `RelationIdLoader.ts`
 *
 * 주어진 Entity의 relation의 id들을 다루는 class를 정의하도록 한다.
 */
export class RelationIdLoader {
    readonly _instance = Symbol.for('RelationIdLoader');

    private readonly manager: Manager;

    readonly queryExecutor: QueryExecutor | undefined;

    constructor(manager: Manager, queryExecutor?: QueryExecutor) {
        this.manager = manager;

        this.queryExecutor = queryExecutor;
    }
}
