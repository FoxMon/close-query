/* eslint-disable @typescript-eslint/ban-types */

/**
 * `GeneratedDataStorageOption.ts`
 */
export interface GeneratedDataStorageOption {
    /**
     * Generated decorator가 명시될 target에 대한 정보를
     * 명시하도록 한다.
     */
    readonly target: Function | string;

    /**
     * 해당 target에 대한 property name을 명시하도록 한다.
     */
    readonly propertyName: string;

    /**
     * Generation 전략을 명시하도록 한다.
     */
    readonly strategy: 'uuid' | 'increment' | 'rowid';
}
