/* eslint-disable @typescript-eslint/ban-types */

import { getStaticStorage } from '../../storage/static';
import { TableDataStorage } from '../../storage/table/TableDataStorage';
import { EntityOption } from '../option/EntityOption';
import { ObjectUtil } from '../../utils/ObjectUtil';

/**
 * `Entity.ts`
 *
 * Database에서 Table의 Entity를 표현하는 Decorator를 정의한다.
 */

/**
 * Class에 사용하는 decorator이다.
 * 해당 decorator는 `Table`을 지정할 때 사용하는 decorator이다.
 *
 * Database schema는 `Entity` decorator가 붙은 class를 `Table`로 인식하게 될 것이다.
 */
export function Entity(options?: EntityOption): ClassDecorator;

/**
 * Class에 사용하는 decorator이다.
 * 해당 decorator는 `Table`을 지정할 때 사용하는 decorator이다.
 *
 * Database schema는 `Entity` decorator가 붙은 class를 `Table`로 인식하게 될 것이다.
 */
export function Entity(name?: string, options?: EntityOption): ClassDecorator;

/**
 * Class에 사용하는 decorator이다.
 * 해당 decorator는 `Table`을 지정할 때 사용하는 decorator이다.
 *
 * Database schema는 `Entity` decorator가 붙은 class를 `Table`로 인식하게 될 것이다.
 */
export function Entity(
    options?: EntityOption | string,
    extraOptions?: EntityOption,
): ClassDecorator {
    const entityOption =
        (ObjectUtil.isObject(options) ? (options as EntityOption) : extraOptions) || {};

    const name: string = typeof options === 'string' ? options : (options?.name as string);

    return function (t: Function | string) {
        getStaticStorage().tables.push({
            database: entityOption.database,
            schema: entityOption.schema,
            name: name,
            targetTable: t,
        } as TableDataStorage);
    };
}
