/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { EventResult } from './EventResult';

interface EventBroadCasters {
    beforeQuery: () => void;
    afterQuery: () => void;
}

/**
 * `EventBroadCaster.ts`
 *
 * Event가 발생하면 해당 class로 subscribe하도록 구현한다.
 */
export class EventBroadCaster {
    readonly '_instance' = Symbol.for('EventBroadCaster');

    queryExecutor: QueryExecutor;

    constructor(queryExecutor: QueryExecutor) {
        this.queryExecutor = queryExecutor;
    }

    async broadcast<U extends keyof EventBroadCasters>(
        event: U,
        ...args: Parameters<EventBroadCasters[U]>
    ): Promise<void> {
        const result = new EventResult();

        const broadcastFunction = this[`broadcast${event}Event` as keyof this];

        if (typeof broadcastFunction === 'function') {
            (broadcastFunction as any).call(this, result, ...args);
        }

        await result.wait();
    }
}
