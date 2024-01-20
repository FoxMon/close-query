/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntitySchemaOption } from '../option/EntitySchemaOption';

/**
 * `EntitySchema.ts`
 *
 * EntitySchema를 정의하는 class이다.
 * DataStorage의 Entity를 대표하는 interface 역할을 하도록 한다.
 */
export class EntitySchema<G = any> {
    readonly '_instance' = Symbol.for('EntitySchema');

    option: EntitySchemaOption<G>;

    constructor(option: EntitySchemaOption<G>) {
        this.option = option;
    }
}
