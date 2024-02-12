/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from '../../error/CQError';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { RelationDataStorage } from '../../storage/RelationDataStorage';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { QueryBuilderUtil } from '../../utils/QueryBuilderUtil';
import { QueryExpression } from '../QueryExpression';
import { SelectQueryBuilder } from '../builder/SelectQueryBuilder';

/**
 * `RelationCountAttribute.ts`
 */
export class RelationCountAttribute {
    alias?: string;

    relationName: string;

    mapToProperty: string;

    queryBuilderFactory?: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>;

    constructor(
        private queryExpression: QueryExpression,
        relationCountAttribute?: Partial<RelationCountAttribute>,
    ) {
        ObjectUtil.assign(this, relationCountAttribute || {});
    }

    get joinInverseSideDataStorage(): CQDataStorage {
        return this.relation.inverseDataStorage;
    }

    get parentAlias(): string {
        if (!QueryBuilderUtil.isAliasProperty(this.relationName)) {
            throw new CQError(`Given value must be a string representation of alias property`);
        }

        return this.relationName.split('.')[0];
    }

    get relationProperty(): string | undefined {
        if (!QueryBuilderUtil.isAliasProperty(this.relationName)) {
            throw new CQError(`Given value is a string representation of alias property`);
        }

        return this.relationName.split('.')[1];
    }

    get junctionAlias(): string {
        const [parentAlias, relationProperty] = this.relationName.split('.');
        return parentAlias + '_' + relationProperty + '_rc';
    }

    get relation(): RelationDataStorage {
        if (!QueryBuilderUtil.isAliasProperty(this.relationName)) {
            throw new CQError(`Given value is a string representation of alias property`);
        }

        const [parentAlias, propertyPath] = this.relationName.split('.');
        const relationOwnerSelection = this.queryExpression.findAliasByName(parentAlias);
        const relation = (
            relationOwnerSelection.dataStorage as CQDataStorage
        ).findRelationWithPropertyPath(propertyPath);

        if (!relation) {
            throw new CQError(
                `Relation with property path ${propertyPath} in entity was not found.`,
            );
        }

        return relation;
    }

    get dataStorage(): CQDataStorage {
        if (!QueryBuilderUtil.isAliasProperty(this.relationName)) {
            throw new CQError(`Given value is a string representation of alias property`);
        }

        const parentAlias = this.relationName.split('.')[0];
        const selection = this.queryExpression.findAliasByName(parentAlias);

        return selection.dataStorage as CQDataStorage;
    }

    get mapToPropertyPropertyName(): string {
        return this.mapToProperty!.split('.')[1];
    }
}
