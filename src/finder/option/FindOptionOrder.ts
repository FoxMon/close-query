/* eslint-disable @typescript-eslint/ban-types */

/**
 * `FindOptionOrder.ts`
 */

export type FindOptionOrderProperty<Property> = Property extends Promise<infer I>
    ? FindOptionOrderProperty<NonNullable<I>>
    : Property extends Array<infer I>
      ? FindOptionOrderProperty<NonNullable<I>>
      : Property extends Function
        ? never
        : Property extends string
          ? FindOptionOrderValue
          : Property extends number
            ? FindOptionOrderValue
            : Property extends boolean
              ? FindOptionOrderValue
              : Property extends Buffer
                ? FindOptionOrderValue
                : Property extends Date
                  ? FindOptionOrderValue
                  : Property extends Object
                    ? FindOptionOrderValue
                    : Property extends object
                      ? FindOptionOrder<Property> | FindOptionOrderValue
                      : FindOptionOrderValue;

/**
 * Order by find options.
 */
export type FindOptionOrder<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
        ? unknown
        : FindOptionOrderProperty<NonNullable<Entity[P]>>;
};

/**
 * Value of order by in find options.
 */
export type FindOptionOrderValue =
    | 'ASC'
    | 'DESC'
    | 'asc'
    | 'desc'
    | 1
    | -1
    | {
          direction?: 'asc' | 'desc' | 'ASC' | 'DESC';
          nulls?: 'first' | 'last' | 'FIRST' | 'LAST';
      };
