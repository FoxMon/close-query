import { ObjectIndexType } from '../../types/ObjectIndexType';

/**
 * `QueryPartialEntity.ts`
 */

export type QueryPartialEntity<T> = {
    [P in keyof T]?: T[P] | (() => string);
};

export type QueryDeepPartialEntity<T> = _QueryDeepPartialEntity<
    ObjectIndexType extends T ? unknown : T
>;

type _QueryDeepPartialEntity<T> = {
    [P in keyof T]?:
        | (T[P] extends Array<infer U>
              ? Array<_QueryDeepPartialEntity<U>>
              : T[P] extends ReadonlyArray<infer U>
                ? ReadonlyArray<_QueryDeepPartialEntity<U>>
                : _QueryDeepPartialEntity<T[P]>)
        | (() => string);
};
