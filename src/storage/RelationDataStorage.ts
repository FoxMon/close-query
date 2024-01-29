/* eslint-disable @typescript-eslint/ban-types */
import { DeferrableType } from '../types/DeferrableType';
import { CQDataStorage } from './CQDataStorage';

/**
 * `RelationDataStorage.ts`
 *
 * Entity의 모든 관계를 담고 있는 정보를 포함하고 있는 class이다.
 */
export class RelationDataStorage {
    readonly '_instance' = Symbol.for('RelationDataStorage');

    dataStorage: CQDataStorage;

    target: Function | string;

    type: Function | string;

    propertyName: string;

    propertyPath: string;

    deferrable?: DeferrableType;

    isPrimary: boolean = false;

    isLazy: boolean = false;

    isEager: boolean = false;

    isNullable: boolean = true;

    isOneToMany: boolean = false;

    isManyToOne: boolean = false;

    isManyToMany: boolean = false;

    joinTableName: string;
}
