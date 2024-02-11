/* eslint-disable @typescript-eslint/ban-types */

import { GeneratedDataStorageOption } from '../../storage/GeneratedDataStorageOption';
import { getStaticStorage } from '../../storage/static';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { ColumnOption } from '../option/ColumnOption';
import { PrimaryGeneratedIdentityOption } from '../option/PrimaryGeneratedIdentityOption';
import { PrimaryGeneratedNumericOption } from '../option/PrimaryGeneratedNumericOption';
import { PrimaryGeneratedUUIDOption } from '../option/PrimaryGeneratedUUIDOption';

/**
 * Generated column에 대한 decorator를 정의하도록 한다.
 */
export function PrimaryGeneratedColumn(): PropertyDecorator;

/**
 * Generated column에 대한 decorator를 정의하도록 한다.
 */
export function PrimaryGeneratedColumn(options: PrimaryGeneratedNumericOption): PropertyDecorator;

/**
 * Generated column에 대한 decorator를 정의하도록 한다.
 */
export function PrimaryGeneratedColumn(
    strategy: 'increment',
    options?: PrimaryGeneratedNumericOption,
): PropertyDecorator;

/**
 * Generated column에 대한 decorator를 정의하도록 한다.
 */
export function PrimaryGeneratedColumn(
    strategy: 'uuid',
    options?: PrimaryGeneratedUUIDOption,
): PropertyDecorator;

/**
 * Generated column에 대한 decorator를 정의하도록 한다.
 */
export function PrimaryGeneratedColumn(
    strategy: 'rowid',
    options?: PrimaryGeneratedUUIDOption,
): PropertyDecorator;

/**
 * Generated column에 대한 decorator를 정의하도록 한다.
 */
export function PrimaryGeneratedColumn(
    strategy: 'identity',
    options?: PrimaryGeneratedIdentityOption,
): PropertyDecorator;

/**
 * Generated column에 대한 decorator를 정의하도록 한다.
 */
export function PrimaryGeneratedColumn(
    strategyOrOption?:
        | 'identity'
        | 'increment'
        | 'uuid'
        | 'rowid'
        | PrimaryGeneratedIdentityOption
        | PrimaryGeneratedNumericOption
        | PrimaryGeneratedUUIDOption,
    maybeOption?:
        | PrimaryGeneratedIdentityOption
        | PrimaryGeneratedNumericOption
        | PrimaryGeneratedUUIDOption,
): PropertyDecorator {
    const option: ColumnOption = {};

    let strategy: 'identity' | 'increment' | 'uuid' | 'rowid';

    if (strategyOrOption) {
        if (typeof strategyOrOption === 'string') {
            strategy = strategyOrOption as 'identity' | 'increment' | 'uuid' | 'rowid';
        }

        if (ObjectUtil.isObject(strategyOrOption)) {
            strategy = 'increment';

            ObjectUtil.assign(option, strategyOrOption);
        }
    } else {
        strategy = 'increment';
    }

    if (ObjectUtil.isObject(maybeOption)) {
        ObjectUtil.assign(option, maybeOption);
    }

    return function (object: Object, propertyName: string) {
        if (option.type) {
            if (strategy === 'increment' || strategy === 'identity') {
                option.type = Number;
            } else if (strategy === 'uuid') {
                option.type = 'uuid';
            } else if (strategy === 'rowid') {
                option.type = 'int';
            }
        }

        option.primary = true;

        getStaticStorage().columns.push({
            target: object.constructor,
            propertyName: propertyName,
            mode: 'regular',
            options: option,
        });

        getStaticStorage().generations.push({
            target: object.constructor,
            propertyName: propertyName,
            strategy: strategy,
        } as GeneratedDataStorageOption);
    };
}
