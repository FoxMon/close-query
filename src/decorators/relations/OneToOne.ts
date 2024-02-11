/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectType } from '../../types/ObjectType';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { RelationOption } from '../option/RelationOption';
import { getStaticStorage } from '../../storage/static';
import { RelationDataStorageOption } from '../../storage/RelationDataStorageOption';

/**
 * `OneToOne.ts`
 */

/**
 * 두 Entity 간의 `One-to-one` 관계성을 명시하도록 한다.
 * `Entity1` <> `Entity2`. 즉, Entity1은 반드시 Entity2만을 가지고 있어야만 한다.
 */
export function OneToOne<T>(target: string | ((type?: any) => ObjectType<T>)): PropertyDecorator;

/**
 * 두 Entity 간의 `One-to-one` 관계성을 명시하도록 한다.
 * `Entity1` <> `Entity2`. 즉, Entity1은 반드시 Entity2만을 가지고 있어야만 한다.
 */
export function OneToOne<T>(
    target: string | ((type?: any) => ObjectType<T>),
    inverseSide?: string | ((object: T) => any),
    option?: RelationOption,
): PropertyDecorator;

/**
 * 두 Entity 간의 `One-to-one` 관계성을 명시하도록 한다.
 * `Entity1` <> `Entity2`. 즉, Entity1은 반드시 Entity2만을 가지고 있어야만 한다.
 */
export function OneToOne<T>(
    target: string | ((type?: any) => ObjectType<T>),
    inverseSideOrOption?: string | ((obj: T) => any) | RelationOption,
    option?: RelationOption,
): PropertyDecorator {
    let inverseSideProperty: string | ((obj: T) => any);

    if (ObjectUtil.isObject(inverseSideOrOption)) {
        option = <RelationOption>inverseSideOrOption;
    } else {
        inverseSideProperty = inverseSideOrOption as any;
    }

    return function (object: Object, propertyName: string) {
        if (!option) {
            option = {} as RelationOption;
        }

        let isLazy = option && option.lazy ? true : false;

        if (!isLazy && Reflect && (Reflect as any).getMetadata) {
            const reflectedType = (Reflect as any).getMetadata(
                'close-query:metadata:type',
                object,
                propertyName,
            );

            if (
                reflectedType &&
                typeof reflectedType.name === 'string' &&
                reflectedType.name.toLowerCase() === 'promise'
            ) {
                isLazy = true;
            }
        }

        getStaticStorage().relations.push({
            target: object.constructor,
            propertyName: propertyName,
            isLazy: isLazy,
            relationType: 'one-to-one',
            type: target,
            inverseSideProperty: inverseSideProperty,
            options: option,
        } as RelationDataStorageOption);
    };
}
