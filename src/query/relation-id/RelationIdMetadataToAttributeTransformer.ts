import { CQDataStorage } from '../../storage/CQDataStorage';
import { RelationIdDataStorage } from '../../storage/RelationIdDataStorage';
import { QueryExpression } from '../QueryExpression';
import { RelationIdAttribute } from '../RelationIdAttribute';

/**
 * `RelationIdMetadataToAttributeTransformer.ts`
 */
export class RelationIdMetadataToAttributeTransformer {
    constructor(protected queryExpression: QueryExpression) {}

    transform() {
        if (this.queryExpression.mainAlias) {
            (this.queryExpression.mainAlias.dataStorage as CQDataStorage).relationIds.forEach(
                (relationId) => {
                    const attribute = this.metadataToAttribute(
                        this.queryExpression.mainAlias!.name,
                        relationId,
                    );
                    this.queryExpression.relationIdAttributes.push(attribute);
                },
            );
        }

        this.queryExpression.joinAttributes.forEach((join) => {
            if (!join.dataStorage || join.dataStorage.isJunction) {
                return;
            }

            join.dataStorage.relationIds.forEach((relationId) => {
                const attribute = this.metadataToAttribute(join.alias.name, relationId);
                this.queryExpression.relationIdAttributes.push(attribute);
            });
        });
    }

    private metadataToAttribute(
        parentAliasName: string,
        relationId: RelationIdDataStorage,
    ): RelationIdAttribute {
        return new RelationIdAttribute(this.queryExpression, {
            relationName: parentAliasName + '.' + relationId.relation.propertyName,
            mapToProperty: parentAliasName + '.' + relationId.propertyName,
            alias: relationId.alias,
            queryBuilderFactory: relationId.queryBuilderFactory,
        });
    }
}
