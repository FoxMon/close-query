/* eslint-disable @typescript-eslint/no-explicit-any */

import { FindOptionOrder } from './FindOptionOrder';
import { FindOptionRelation } from './FindOptionRelation';
import { FindOptionSelect } from './FindOptionSelect';
import { FindOptionWhere } from './FindOptionWhere';

/**
 * `FindOneOption.ts`
 */
export interface FindOneOption<Entity = any> {
    comment?: string;

    select?: FindOptionSelect<Entity>;

    where?: FindOptionWhere<Entity>[] | FindOptionWhere<Entity>;

    relations?: FindOptionRelation<Entity>;

    relationLoadStrategy?: 'join' | 'query';

    order?: FindOptionOrder<Entity>;

    cache?: boolean | number | { id: any; milliseconds: number };

    lock?:
        | { mode: 'optimistic'; version: number | Date }
        | {
              mode:
                  | 'pessimistic_read'
                  | 'pessimistic_write'
                  | 'dirty_read'
                  | 'pessimistic_partial_write'
                  | 'pessimistic_write_or_fail'
                  | 'for_no_key_update'
                  | 'for_key_share';
              tables?: string[];
              onLocked?: 'nowait' | 'skip_locked';
          };

    withDeleted?: boolean;

    loadRelationIds?: boolean | { relations?: string[]; disableMixedMap?: boolean };

    loadEagerRelations?: boolean;

    transaction?: boolean;
}
