/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { ColumnTypeError } from '../../error/ColumnTypeError';
import { EmbeddedDataStorageOption } from '../../storage/EmbeddedDataStorageOption';
import { ColumnDataStorageOption } from '../../storage/column/ColumnDataStorageOption';
import { getStaticStorage } from '../../storage/static';
import { ColumnType } from '../../types/column/ColumType';
import { ColumnEmbeddedOption } from '../option/ColumnEmbeddedOption';
import { ColumnOption } from '../option/ColumnOption';

/**
 * `Column.ts`
 *
 * Database에서 특정 어느 Table의 Column을 정의할 때 사용하는
 * Decorator를 정의한다.
 */

/**
 * Column decorator는 특정 Table의 어떠한 column에 붙는 decorator이다.
 * 표현하고자 하는 class 내부의 property에 사용할 수 있다.
 */
export function Column(): PropertyDecorator;

/**
 * Column decorator는 특정 Table의 어떠한 column에 붙는 decorator이다.
 * 표현하고자 하는 class 내부의 property에 사용할 수 있다.
 */
export function Column(options: ColumnOption): PropertyDecorator;

/**
 * Column decorator는 특정 Table의 어떠한 column에 붙는 decorator이다.
 * 표현하고자 하는 class 내부의 property에 사용할 수 있다.
 */
export function Column(
    options?: ((type?: any) => Function) | ColumnType | (ColumnOption & ColumnEmbeddedOption),
    extraOptions?: ColumnOption & ColumnEmbeddedOption,
): PropertyDecorator {
    return function (obj: Object, propertyName: string) {
        let type: ColumnType | undefined;

        if (typeof extraOptions === 'string' || typeof extraOptions === 'function') {
            type = <ColumnType>extraOptions;
        } else if (extraOptions) {
            extraOptions = <ColumnOption>extraOptions;
            type = extraOptions.type;
        }

        if (!extraOptions) {
            extraOptions = {} as ColumnOption;
        }

        const reflectMedata =
            Reflect && (Reflect as any).getMetadata
                ? (Reflect as any).getMetadata('close-query:metadata:type', obj, propertyName)
                : undefined;

        if (!type && reflectMedata) {
            type = reflectMedata;
        }

        if (!extraOptions.type && type) {
            extraOptions.type = type;
        }

        if (typeof options === 'function') {
            getStaticStorage().embeddeds.push({
                target: obj.constructor,
                propertyName: propertyName,
                isArray: reflectMedata === Array || extraOptions.array === true,
                prefix: extraOptions.prefix ? extraOptions.prefix : undefined,
                type: options as (type?: any) => Function,
            } as EmbeddedDataStorageOption);
        } else {
            if (!extraOptions.type) {
                throw new ColumnTypeError(obj, propertyName);
            }

            if (extraOptions.unique) {
                /**
                 * @TODO 유니크
                 */
            }

            getStaticStorage().columns.push({
                target: obj.constructor,
                propertyName: propertyName,
                mode: 'regular',
                options: extraOptions,
            } as ColumnDataStorageOption);
        }
    };
}
