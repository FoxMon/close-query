/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { EqualOperator } from '../EqualOperator';
import { FindOperator } from '../FindOperator';

/**
 * `FindOptionWhere.ts`
 */

export type FindOptionsWhereProperty<
    PropertyToBeNarrowed,
    Property = PropertyToBeNarrowed,
> = PropertyToBeNarrowed extends Promise<infer I>
    ? FindOptionsWhereProperty<NonNullable<I>>
    : PropertyToBeNarrowed extends Array<infer I>
      ? FindOptionsWhereProperty<NonNullable<I>>
      : PropertyToBeNarrowed extends Function
        ? never
        : PropertyToBeNarrowed extends Buffer
          ? Property | FindOperator<Property>
          : PropertyToBeNarrowed extends Date
            ? Property | FindOperator<Property>
            : PropertyToBeNarrowed extends Object
              ? Property | FindOperator<Property>
              : PropertyToBeNarrowed extends string
                ? Property | FindOperator<Property>
                : PropertyToBeNarrowed extends number
                  ? Property | FindOperator<Property>
                  : PropertyToBeNarrowed extends boolean
                    ? Property | FindOperator<Property>
                    : PropertyToBeNarrowed extends object
                      ?
                            | FindOptionWhere<Property>
                            | FindOptionWhere<Property>[]
                            | EqualOperator<Property>
                            | FindOperator<any>
                            | boolean
                            | Property
                      : Property | FindOperator<Property>;

export type FindOptionWhere<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
        ? unknown
        : FindOptionsWhereProperty<NonNullable<Entity[P]>>;
};
