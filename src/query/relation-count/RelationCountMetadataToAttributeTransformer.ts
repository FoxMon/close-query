import { CQDataStorage } from '../../storage/CQDataStorage';
import { RelationCountDataStorage } from '../../storage/RelationCountDataStorage';
import { QueryExpression } from '../QueryExpression';
import { RelationCountAttribute } from './RelationCountAttribute';

/**
 * `RelationCountMetadataToAttributeTransformer.ts`
 */
export class RelationCountMetadataToAttributeTransformer {
    constructor(protected queryExpression: QueryExpression) {}

    transform() {
        if (this.queryExpression.mainAlias) {
            (this.queryExpression.mainAlias.dataStorage as CQDataStorage).relationCounts.forEach(
                (relationCount) => {
                    const attribute = this.metadataToAttribute(
                        this.queryExpression.mainAlias!.name,
                        relationCount,
                    );
                    this.queryExpression.relationCountAttributes.push(attribute);
                },
            );
        }

        this.queryExpression.joinAttributes.forEach((join) => {
            if (!join.dataStorage || join.dataStorage.isJunction) return;

            join.dataStorage.relationCounts.forEach((relationCount) => {
                const attribute = this.metadataToAttribute(join.alias.name, relationCount);
                this.queryExpression.relationCountAttributes.push(attribute);
            });
        });
    }

    private metadataToAttribute(
        parentAliasName: string,
        relationCount: RelationCountDataStorage,
    ): RelationCountAttribute {
        return new RelationCountAttribute(this.queryExpression, {
            relationName: parentAliasName + '.' + relationCount.relation.propertyName,
            mapToProperty: parentAliasName + '.' + relationCount.propertyName,
            alias: relationCount.alias,
            queryBuilderFactory: relationCount.queryBuilderFactory,
        });
    }
}
