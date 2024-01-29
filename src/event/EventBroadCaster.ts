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

    async broadcast<T extends keyof EventBroadCasters>(
        event: T,
        ...args: Parameters<EventBroadCasters[T]>
    ): Promise<void> {
        const result = new EventResult();

        const broadcastFunction = this[`broadcast${event}Event` as keyof this];

        if (typeof broadcastFunction === 'function') {
            (broadcastFunction as any).call(this, result, ...args);
        }

        await result.wait();
    }

    broadcastBeforeQueryEvent(result: EventResult, query: string, params: undefined | any[]) {
        if (this.queryExecutor.manager.subscribers.length) {
            this.queryExecutor.manager.subscribers.forEach((sub) => {
                if (sub.beforeQuery) {
                    const executionResult = sub.beforeQuery({
                        manager: this.queryExecutor.manager,
                        queryExecutor: this.queryExecutor,
                        entityManager: this.queryExecutor.entityManager,
                        query: query,
                        params: params,
                    });

                    if (executionResult instanceof Promise) {
                        result.promises.push(executionResult);
                    }

                    result.count++;
                }
            });
        }
    }

    broadcastAfterQueryEvent(
        result: EventResult,
        query: string,
        params: undefined | any[],
        success: boolean,
        executionTime: undefined | number,
        rawResults: undefined | any,
        error: undefined | any,
    ): void {
        if (this.queryExecutor.manager.subscribers.length) {
            this.queryExecutor.manager.subscribers.forEach((subscriber) => {
                if (subscriber.afterQuery) {
                    const executionResult = subscriber.afterQuery({
                        manager: this.queryExecutor.manager,
                        queryExecutor: this.queryExecutor,
                        entityManager: this.queryExecutor.entityManager,
                        query: query,
                        params: params,
                        success: success,
                        executionTime: executionTime,
                        rawResults: rawResults,
                        error: error,
                    });

                    if (executionResult instanceof Promise) {
                        result.promises.push(executionResult);
                    }

                    result.count++;
                }
            });
        }
    }
}
