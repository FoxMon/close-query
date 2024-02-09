/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `PropertyTypeFactory.ts`
 */
export type PropertyTypeFactory<T> = string | ((t: T) => string | any);
