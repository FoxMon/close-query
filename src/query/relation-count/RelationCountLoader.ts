/* eslint-disable @typescript-eslint/no-explicit-any */

import { Manager } from '../../manager/Manager';
import { ColumnDataStorage } from '../../storage/column/ColumnDataStorage';
import { QueryExecutor } from '../executor/QueryExecutor';
import { RelationCountAttribute } from './RelationCountAttribute';
import { RelationCountLoadResult } from './RelationCountLoadResult';

/**
 * `RelationCountLoader.ts`
 */
export class RelationCountLoader {
    constructor(
        protected manager: Manager,
        protected queryExecutor: QueryExecutor | undefined,
        protected relationCountAttributes: RelationCountAttribute[],
    ) {}

    async load(rawEntities: any[]): Promise<RelationCountLoadResult[]> {
        const onlyUnique = (value: any, index: number, self: any) => {
            return self.indexOf(value) === index;
        };

        const promises = this.relationCountAttributes.map(async (relationCountAttr) => {
            if (relationCountAttr.relation.isOneToMany) {
                const relation = relationCountAttr.relation;
                const inverseRelation = relation.inverseRelation!;
                const referenceColumnName =
                    inverseRelation.joinColumns[0].referencedColumn!.propertyName;
                const inverseSideTable = relation.inverseDataStorage.target;
                const inverseSideTableName = relation.inverseDataStorage.tableName;
                const inverseSideTableAlias = relationCountAttr.alias || inverseSideTableName;
                const inverseSidePropertyName = inverseRelation.propertyName;

                let referenceColumnValues = rawEntities
                    .map(
                        (rawEntity) =>
                            rawEntity[relationCountAttr.parentAlias + '_' + referenceColumnName],
                    )
                    .filter((value) => !!value);

                referenceColumnValues = referenceColumnValues.filter(onlyUnique);

                if (referenceColumnValues.length === 0) {
                    return {
                        relationCountAttribute: relationCountAttr,
                        results: [],
                    };
                }

                const qb = this.manager.createQueryBuilder(this.queryExecutor);

                qb.select(inverseSideTableAlias + '.' + inverseSidePropertyName, 'parentId')
                    .addSelect('COUNT(*)', 'cnt')
                    .from(inverseSideTable, inverseSideTableAlias)
                    .where(inverseSideTableAlias + '.' + inverseSidePropertyName + ' IN (:...ids)')
                    .addGroupBy(inverseSideTableAlias + '.' + inverseSidePropertyName)
                    .setParam('ids', referenceColumnValues);

                if (relationCountAttr.queryBuilderFactory) {
                    relationCountAttr.queryBuilderFactory(qb);
                }

                return {
                    relationCountAttribute: relationCountAttr,
                    results: await qb.getRawMany(),
                };
            } else {
                let joinTableColumnName: string;
                let inverseJoinColumnName: string;
                let firstJunctionColumn: ColumnDataStorage;
                let secondJunctionColumn: ColumnDataStorage;

                if (relationCountAttr.relation.isOwning) {
                    joinTableColumnName =
                        relationCountAttr.relation.joinColumns[0].referencedColumn!.databaseName;
                    inverseJoinColumnName =
                        relationCountAttr.relation.inverseJoinColumns[0].referencedColumn!
                            .databaseName;
                    firstJunctionColumn =
                        relationCountAttr.relation.junctionDataStorage!.columns[0];
                    secondJunctionColumn =
                        relationCountAttr.relation.junctionDataStorage!.columns[1];
                } else {
                    joinTableColumnName =
                        relationCountAttr.relation.inverseRelation!.inverseJoinColumns[0]
                            .referencedColumn!.databaseName;
                    inverseJoinColumnName =
                        relationCountAttr.relation.inverseRelation!.joinColumns[0].referencedColumn!
                            .databaseName;
                    firstJunctionColumn =
                        relationCountAttr.relation.junctionDataStorage!.columns[1];
                    secondJunctionColumn =
                        relationCountAttr.relation.junctionDataStorage!.columns[0];
                }

                let referenceColumnValues = rawEntities
                    .map(
                        (rawEntity) =>
                            rawEntity[relationCountAttr.parentAlias + '_' + joinTableColumnName],
                    )
                    .filter((value) => !!value);

                referenceColumnValues = referenceColumnValues.filter(onlyUnique);

                if (referenceColumnValues.length === 0) {
                    return {
                        relationCountAttribute: relationCountAttr,
                        results: [],
                    };
                }

                const junctionAlias = relationCountAttr.junctionAlias;
                const inverseSideTableName = relationCountAttr.joinInverseSideDataStorage.tableName;
                const inverseSideTableAlias = relationCountAttr.alias || inverseSideTableName;
                const junctionTableName = relationCountAttr.relation.junctionDataStorage!.tableName;

                const condition =
                    junctionAlias +
                    '.' +
                    firstJunctionColumn.propertyName +
                    ' IN (' +
                    referenceColumnValues.map((vals) => (isNaN(vals) ? "'" + vals + "'" : vals)) +
                    ')' +
                    ' AND ' +
                    junctionAlias +
                    '.' +
                    secondJunctionColumn.propertyName +
                    ' = ' +
                    inverseSideTableAlias +
                    '.' +
                    inverseJoinColumnName;

                const qb = this.manager.createQueryBuilder(this.queryExecutor);

                qb.select(junctionAlias + '.' + firstJunctionColumn.propertyName, 'parentId')
                    .addSelect(
                        'COUNT(' +
                            qb.escape(inverseSideTableAlias) +
                            '.' +
                            qb.escape(inverseJoinColumnName) +
                            ')',
                        'cnt',
                    )
                    .from(inverseSideTableName, inverseSideTableAlias)
                    .innerJoin(junctionTableName, junctionAlias, condition)
                    .addGroupBy(junctionAlias + '.' + firstJunctionColumn.propertyName);

                if (relationCountAttr.queryBuilderFactory) {
                    relationCountAttr.queryBuilderFactory(qb);
                }

                return {
                    relationCountAttribute: relationCountAttr,
                    results: await qb.getRawMany(),
                };
            }
        });

        return Promise.all(promises);
    }
}
