import { QueryStore } from './QueryStore';

/**
 * `SQLMemory.ts`
 *
 * Query memory 저장용 class를 정의하도록 한다.
 */
export class SQLMemory {
    readonly '_instance' = Symbol.for('SQLMemory');

    upQueries: QueryStore[] = [];

    downQueries: QueryStore[] = [];

    constructor() {
        this.upQueries = [];

        this.downQueries = [];
    }
}
