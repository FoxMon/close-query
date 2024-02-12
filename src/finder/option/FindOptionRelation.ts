/* eslint-disable @typescript-eslint/ban-types */

/**
 * `FindOptionRelation.ts`
 */

export type FindOptionRelationProperty<Property> = Property extends Promise<infer I>
    ? FindOptionRelationProperty<NonNullable<I>> | boolean
    : Property extends Array<infer I>
      ? FindOptionRelationProperty<NonNullable<I>> | boolean
      : Property extends string
        ? never
        : Property extends number
          ? never
          : Property extends boolean
            ? never
            : Property extends Function
              ? never
              : Property extends Buffer
                ? never
                : Property extends Date
                  ? never
                  : Property extends Object
                    ? never
                    : Property extends object
                      ? FindOptionRelation<Property> | boolean
                      : boolean;

export type FindOptionRelation<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
        ? unknown
        : FindOptionRelationProperty<NonNullable<Entity[P]>>;
};
