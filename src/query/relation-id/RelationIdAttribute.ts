/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from '../../error/CQError';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { RelationDataStorage } from '../../storage/RelationDataStorage';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { QueryBuilderUtil } from '../../utils/QueryBuilderUtil';
import { QueryExpression } from '../QueryExpression';
import { SelectQueryBuilder } from '../builder/SelectQueryBuilder';

/**
 * `RelationIdAttribute.ts`
 */
export class RelationIdAttribute {
    alias?: string;

    relationName: string;

    mapToProperty: string;

    queryBuilderFactory?: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>;

    disableMixedMap = false;

    constructor(
        private queryExpression: QueryExpression,
        relationIdAttribute?: Partial<RelationIdAttribute>,
    ) {
        ObjectUtil.assign(this, relationIdAttribute || {});
    }

    get joinInverseSideDataStorage(): CQDataStorage {
        return this.relation.inverseDataStorage;
    }

    get parentAlias(): string {
        if (!QueryBuilderUtil.isAliasProperty(this.relationName)) {
            throw new CQError(`Given value must be a string representation of alias property`);
        }

        return this.relationName.substr(0, this.relationName.indexOf('.'));
    }

    get relationPropertyPath(): string {
        if (!QueryBuilderUtil.isAliasProperty(this.relationName)) {
            throw new CQError(`Given value must be a string representation of alias property`);
        }

        return this.relationName.substr(this.relationName.indexOf('.') + 1);
    }

    get relation(): RelationDataStorage {
        if (!QueryBuilderUtil.isAliasProperty(this.relationName)) {
            throw new CQError(`Given value must be a string representation of alias property`);
        }

        const relationOwnerSelection = this.queryExpression.findAliasByName(this.parentAlias!);
        const relation = (
            relationOwnerSelection.dataStorage as CQDataStorage
        ).findRelationWithPropertyPath(this.relationPropertyPath!);

        if (!relation) {
            throw new CQError(
                `Relation with property path ${this.relationPropertyPath} in entity was not found.`,
            );
        }

        return relation;
    }

    get junctionAlias(): string {
        const [parentAlias, relationProperty] = this.relationName.split('.');
        return parentAlias + '_' + relationProperty + '_rid';
    }

    get junctionDataStorage(): CQDataStorage {
        return this.relation.junctionDataStorage!;
    }

    get mapToPropertyParentAlias(): string {
        return this.mapToProperty.substr(0, this.mapToProperty.indexOf('.'));
    }

    get mapToPropertyPropertyPath(): string {
        return this.mapToProperty.substr(this.mapToProperty.indexOf('.') + 1);
    }
}
