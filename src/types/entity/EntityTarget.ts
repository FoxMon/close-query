import { EntitySchema } from '../../schema/entity/EntitySchema';
import { ObjectIndexType } from '../ObjectIndexType';

/**
 * `EntityTarget.ts`
 *
 * EntityTarget type을 정의하도록 한다.
 */
export type EntityTarget<Entity> =
    | EntitySchema<Entity>
    | ObjectIndexType
    | string
    | { type: Entity; name: string };
