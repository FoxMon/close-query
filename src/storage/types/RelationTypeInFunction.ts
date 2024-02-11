/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntityTarget } from '../../types/entity/EntityTarget';

/**
 * `RelationTypeInFunction.ts`
 */
export type RelationTypeInFunction = ((type?: any) => Function) | EntityTarget<any>;
