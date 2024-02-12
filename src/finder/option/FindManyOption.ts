/* eslint-disable @typescript-eslint/no-explicit-any */

import { FindOneOption } from './FindOneOption';

/**
 * `FindManyOption.ts`
 */
export interface FindManyOption<Entity = any> extends FindOneOption<Entity> {
    skip?: number;

    take?: number;
}
