/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { RelationOption } from '../decorators/option/RelationOption';
import { PropertyTypeFactory } from './types/PropertyTypeFactory';
import { RelationType } from './types/RelationType';
import { RelationTypeInFunction } from './types/RelationTypeInFunction';

/**
 * `RelationDataStorageOption.ts`
 */
export interface RelationDataStorageOption {
    /**
     * Relation이 적용될 target에 대한 정보를 담도록 한다.
     */
    readonly target: Function | string;

    /**
     * 해당 target에 대한 property name을 명시하도록 한다.
     */
    readonly propertyName: string;

    /**
     * Is lazy load?
     */
    readonly isLazy: boolean;

    /**
     * 관계성에 대한 타입을 정의한다.
     */
    readonly relationType: RelationType;

    /**
     * 관계에 대한 타입을 명시한다.
     */
    readonly type: RelationTypeInFunction;

    /**
     * 관계의 반대편에 대한 타입을 명시하도록 한다.
     */
    readonly inverseSideProperty?: PropertyTypeFactory<any>;

    /**
     * 추가적인 Relation의 Option을 명시하도록 한다.
     */
    readonly options: RelationOption;

    /**
     * Is tree parent?
     */
    readonly isTreeParent?: boolean;

    /**
     * Is tree children?
     */
    readonly isTreeChildren?: boolean;
}
