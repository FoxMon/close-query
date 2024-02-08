/* eslint-disable @typescript-eslint/ban-types */

import { Naming } from '../naming/Naming';
import { CQDataStorage } from './CQDataStorage';
import { CheckDataStorageOption } from './CheckDataStorageOption';

/**
 * `CheckMetadata.ts`
 *
 * Table의 check 제약조건을 다루는 정보를 담고 있는 class
 */
export class CheckDataStorage {
    dataStorage: CQDataStorage;

    target?: Function | string;

    expression: string;

    givenName?: string;

    name: string;

    constructor(options: { dataStorage: CQDataStorage; args?: CheckDataStorageOption }) {
        this.dataStorage = options.dataStorage;

        if (options.args) {
            this.target = options.args.target;
            this.expression = options.args.expression;
            this.givenName = options.args.name;
        }
    }

    // ---------------------------------------------------------------------
    // Public Build Methods
    // ---------------------------------------------------------------------

    /**
     * Builds some depend check constraint properties.
     * Must be called after all entity metadata's properties map, columns and relations are built.
     */
    build(naming: Naming): this {
        this.name = this.givenName
            ? this.givenName
            : naming.checkConstraintName(this.dataStorage.tableName, this.expression);
        return this;
    }
}
