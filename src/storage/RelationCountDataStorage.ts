/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from '../error/CQError';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { CQDataStorage } from './CQDataStorage';
import { RelationCountDataStorageOption } from './RelationCountDataStorageOption';
import { RelationDataStorage } from './RelationDataStorage';

/**
 * `RelationCountMetadata.ts`
 */
export class RelationCountDataStorage {
    dataStorage: CQDataStorage;

    relation: RelationDataStorage;

    relationNameOrFactory: string | ((object: any) => any);

    target: Function | string;

    propertyName: string;

    alias?: string;

    queryBuilderFactory?: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>;

    constructor(options: { dataStorage: CQDataStorage; args: RelationCountDataStorageOption }) {
        this.dataStorage = options.dataStorage;
        this.target = options.args.target;
        this.propertyName = options.args.propertyName;
        this.relationNameOrFactory = options.args.relation;
        this.alias = options.args.alias;
        this.queryBuilderFactory = options.args.queryBuilderFactory;
    }

    create() {
        const propertyPath =
            typeof this.relationNameOrFactory === 'function'
                ? this.relationNameOrFactory(this.dataStorage.propertiesMap)
                : this.relationNameOrFactory;
        const relation = this.dataStorage.findRelationWithPropertyPath(propertyPath);

        if (!relation) {
            throw new CQError(
                `Cannot find relation ${propertyPath}. Wrong relation specified for @RelationCount decorator.`,
            );
        }

        this.relation = relation;
    }
}
