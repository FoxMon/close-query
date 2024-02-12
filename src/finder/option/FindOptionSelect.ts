/* eslint-disable @typescript-eslint/ban-types */

/**
 * `FindOptionSelect.ts`
 */

export type FindOptionSelectProperty<Property> = Property extends Promise<infer I>
    ? FindOptionSelectProperty<I> | boolean
    : Property extends Array<infer I>
      ? FindOptionSelectProperty<I> | boolean
      : Property extends string
        ? boolean
        : Property extends number
          ? boolean
          : Property extends boolean
            ? boolean
            : Property extends Function
              ? never
              : Property extends Buffer
                ? boolean
                : Property extends Date
                  ? boolean
                  : Property extends Object
                    ? boolean
                    : Property extends object
                      ? FindOptionSelect<Property>
                      : boolean;

export type FindOptionSelect<Entity> = {
    [P in keyof Entity]?: P extends 'toString'
        ? unknown
        : FindOptionSelectProperty<NonNullable<Entity[P]>>;
};
