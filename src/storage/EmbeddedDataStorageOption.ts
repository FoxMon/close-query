/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * `EmbeddedDataStorageOption.ts`
 *
 * EmbeddedDataStorage class에서 사용할 option을 정의한다.
 */
export interface EmbeddedDataStorageOption {
    /**
     * 대상이 될 target을 지정한다.
     */
    target: Function | string;

    /**
     * Column에 사용되는 property이름을 지정한다.
     */
    propertyName: string;

    /**
     * Array인지?
     */
    isArray: boolean;

    /**
     * PropertyName 대신에 사용할 수 있는 prefix를 지정한다.
     */
    prefix?: string | boolean;

    /**
     * Embedded가 될 class의 type을 지정한다.
     */
    type: (type?: any) => Function | string;
}
