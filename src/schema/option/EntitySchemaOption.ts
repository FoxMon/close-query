/* eslint-disable @typescript-eslint/ban-types */

/**
 * `EntitySchemaOption.ts`
 *
 * EntitySchema를 정의하는 class이다.
 * DataStorage의 Entity를 대표하는 interface 역할을 하도록 한다.
 */
export class EntitySchemaOption<G> {
    target?: Function;

    name: string;

    tableName?: string;

    database?: string;

    schema?: string;

    discriminatorValue?: string;
}
