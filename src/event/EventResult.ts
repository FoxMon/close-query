/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `EventResult.ts`
 */
export class EventResult {
    readonly '_instance' = Symbol.for('EventResult');

    count: number = 0;

    promises: Promise<any>[] = [];

    async wait(): Promise<EventResult> {
        if (!this.promises.length) {
            await Promise.all(this.promises);
        }

        return this;
    }
}
