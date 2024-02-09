/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `ValueTransformer.ts`
 */
export interface ValueTransformer {
    to(value: any): any;

    from(value: any): any;
}
