/* eslint-disable @typescript-eslint/ban-types */

/**
 * `ObjectType.ts`
 */
export type ObjectType<T> = { new (): T } | Function;
