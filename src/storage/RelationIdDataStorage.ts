/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from '../error/CQError';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { CQDataStorage } from './CQDataStorage';
import { RelationDataStorage } from './RelationDataStorage';
import { RelationIdDataStorageOption } from './RelationIdDataStorageOption';

/**
 * `RelationIdDataStorage.ts`
 *
 * Entity의 Relation의 갯수를 counting하는 class를 정의한다.
 */
export class RelationIdDataStorage {
    dataStorage: CQDataStorage;

    relation: RelationDataStorage;

    relationNameOrFactory: string | ((object: any) => any);

    target: Function | string;

    propertyName: string;

    alias?: string;

    queryBuilderFactory?: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>;

    constructor(options: { dataStorage: CQDataStorage; args: RelationIdDataStorageOption }) {
        this.dataStorage = options.dataStorage;
        this.target = options.args.target;
        this.propertyName = options.args.propertyName;
        this.relationNameOrFactory = options.args.relation;
        this.alias = options.args.alias;
        this.queryBuilderFactory = options.args.queryBuilderFactory;
    }

    setValue(entity: ObjectIndexType) {
        const inverseEntity = this.relation.getEntityValue(entity);

        if (Array.isArray(inverseEntity)) {
            entity[this.propertyName] = inverseEntity
                .map((item) => {
                    return this.relation.inverseEntityMetadata.getEntityIdMixedMap(item);
                })
                .filter((item) => item !== null && item !== undefined);
        } else {
            const value = this.relation.inverseEntityMetadata.getEntityIdMixedMap(inverseEntity);
            if (value !== undefined) entity[this.propertyName] = value;
        }
    }

    create() {
        const propertyPath =
            typeof this.relationNameOrFactory === 'function'
                ? this.relationNameOrFactory(this.dataStorage.propertiesMap)
                : this.relationNameOrFactory;
        const relation = this.dataStorage.findRelationWithPropertyPath(propertyPath);
        if (!relation)
            throw new CQError(
                `Cannot find relation ${propertyPath}. Wrong relation specified for @RelationId decorator.`,
            );

        this.relation = relation;
    }
}
