/* eslint-disable @typescript-eslint/ban-types */

import { Naming } from '../naming/Naming';
import { CQDataStorage } from './CQDataStorage';
import { ExclusionDataStorageOption } from './ExclusionDataStorageOption';

export class ExclusionDataStorage {
    dataStorage: CQDataStorage;

    target?: Function | string;

    expression: string;

    givenName?: string;

    name: string;

    constructor(options: { dataStorage: CQDataStorage; args?: ExclusionDataStorageOption }) {
        this.dataStorage = options.dataStorage;

        if (options.args) {
            this.target = options.args.target;
            this.expression = options.args.expression;
            this.givenName = options.args.name;
        }
    }

    build(naming: Naming): this {
        this.name = this.givenName
            ? this.givenName
            : naming.exclusionConstraintName(this.dataStorage.tableName, this.expression);
        return this;
    }
}
