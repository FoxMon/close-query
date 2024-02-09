/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ValueTransformer } from '../types/ValueTransformer';

/**
 * `ObjectUtil.ts`
 */
export class ObjectUtil {
    readonly '_instance' = Symbol.for('ObjectUtil');

    /**
     * 주어진 value가 Object인지 검사한다.
     * 주의할 것은 `typeof nul === "object"` 이므로, Object로 검사하도록 한다.
     * Object가 아니라면 다른 맥락으로 위험한 상황이 야기될 수 있으므로 주의한다.
     *
     * @param {unknown} v
     * @returns {boolean}
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    static isObject(v: unknown): v is Object {
        return v !== null && typeof v === 'object';
    }

    /**
     * Object인지 추가적으로 더 확인하기 위해서
     * 아래의 유틸 함수를 사용하도록 한다.
     *
     * @param {any} v
     * @returns {boolean}
     */
    static withName(v: any): v is Object & { name: string } {
        return v !== null && typeof v === 'object' && v['name'] !== undefined;
    }

    /**
     * Object의 모든 property를 Target에 복사 하도록 한다.
     *
     * @param {T} t
     * @param {V} v
     */
    static assign<T, V>(t: T, v: V): void;

    /**
     * Object의 모든 property를 Target에 복사 하도록 한다.
     *
     * @param {T} t
     * @param {V} v1
     * @param {U} v2
     */
    static assign<T, V, U>(t: T, v1: V, v2: U): void;

    /**
     * Object의 모든 property를 Target에 복사 하도록 한다.
     *
     * @param {T} t
     * @param {V} v1
     * @param {U} v2
     * @param {X} v3
     */
    static assign<T, V, U, X>(t: T, v1: V, v2: U, v3: X): void;

    /**
     * Object의 모든 property를 Target에 복사 하도록 한다.
     *
     * @param {object} t
     * @param {any[]} v
     */
    static assign(t: object, ...elems: any[]): void {
        for (const e of elems) {
            for (const p of Object.getOwnPropertyNames(e)) {
                (t as any)[p] = e[p];
            }
        }
    }

    /**
     * Data 변환 ~~에서
     *
     * @param {ValueTransformer} transformer
     * @param {any} databaseValue
     * @returns  {any}
     */
    static transformFrom(transformer: ValueTransformer | ValueTransformer[], databaseValue: any) {
        if (Array.isArray(transformer)) {
            const reverseTransformers = transformer.slice().reverse();
            return reverseTransformers.reduce((transformedValue, _transformer) => {
                return _transformer.from(transformedValue);
            }, databaseValue);
        }
        return transformer.from(databaseValue);
    }

    /**
     * ~~ 로
     *
     * @param {ValueTransformer} transformer
     * @param {any} databaseValue
     * @returns  {any}
     */
    static transformTo(transformer: ValueTransformer | ValueTransformer[], entityValue: any) {
        if (Array.isArray(transformer)) {
            return transformer.reduce((transformedValue, _transformer) => {
                return _transformer.to(transformedValue);
            }, entityValue);
        }
        return transformer.to(entityValue);
    }
}
