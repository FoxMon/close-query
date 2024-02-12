/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConnectorBuilder } from '../../connector/ConnectorBuilder';
import { Manager } from '../../manager/Manager';
import { RelationDataStorage } from '../../storage/RelationDataStorage';
import { ColumnDataStorage } from '../../storage/column/ColumnDataStorage';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { QueryExecutor } from '../executor/QueryExecutor';
import { SelectQueryBuilder } from './SelectQueryBuilder';

export class RelationIdLoader {
    readonly _instance = Symbol.for('RelationIdLoader');

    constructor(
        private connection: Manager,
        protected queryRunner?: QueryExecutor | undefined,
    ) {}
    load(
        relation: RelationDataStorage,
        entityOrEntities: ObjectIndexType | ObjectIndexType[],
        relatedEntityOrRelatedEntities?: ObjectIndexType | ObjectIndexType[],
    ): Promise<any[]> {
        const entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];
        const relatedEntities = Array.isArray(relatedEntityOrRelatedEntities)
            ? relatedEntityOrRelatedEntities
            : relatedEntityOrRelatedEntities
              ? [relatedEntityOrRelatedEntities]
              : undefined;

        if (relation.isManyToMany) {
            return this.loadForManyToMany(relation, entities, relatedEntities);
        } else if (relation.isManyToOne || relation.isOneToOneOwner) {
            return this.loadForManyToOneAndOneToOneOwner(relation, entities, relatedEntities);
        } else {
            return this.loadForOneToManyAndOneToOneNotOwner(relation, entities, relatedEntities);
        }
    }

    async loadManyToManyRelationIdsAndGroup<E1 extends ObjectIndexType, E2 extends ObjectIndexType>(
        relation: RelationDataStorage,
        entitiesOrEntities: E1 | E1[],
        relatedEntityOrEntities?: E2 | E2[],
        queryBuilder?: SelectQueryBuilder<any>,
    ): Promise<{ entity: E1; related?: E2 | E2[] }[]> {
        const isMany = relation.isManyToMany || relation.isOneToMany;
        const entities: E1[] = Array.isArray(entitiesOrEntities)
            ? entitiesOrEntities
            : [entitiesOrEntities];

        if (!relatedEntityOrEntities) {
            relatedEntityOrEntities = await this.connection.relationLoader.load(
                relation,
                entitiesOrEntities,
                this.queryRunner,
                queryBuilder,
            );
            if (!relatedEntityOrEntities.length)
                return entities.map((entity) => ({
                    entity: entity,
                    related: isMany ? [] : undefined,
                }));
        }
        const relationIds = await this.load(relation, entitiesOrEntities, relatedEntityOrEntities);

        const relatedEntities: E2[] = Array.isArray(relatedEntityOrEntities)
            ? relatedEntityOrEntities
            : [relatedEntityOrEntities!];

        let columns: ColumnDataStorage[] = [],
            inverseColumns: ColumnDataStorage[] = [];
        if (relation.isManyToManyOwner) {
            columns = relation.junctionDataStorage!.inverseColumns.map(
                (column) => column.referencedColumn!,
            );
            inverseColumns = relation.junctionDataStorage!.ownerColumns.map(
                (column) => column.referencedColumn!,
            );
        } else if (relation.isManyToManyNotOwner) {
            columns = relation.junctionDataStorage!.ownerColumns.map(
                (column) => column.referencedColumn!,
            );
            inverseColumns = relation.junctionDataStorage!.inverseColumns.map(
                (column) => column.referencedColumn!,
            );
        } else if (relation.isManyToOne || relation.isOneToOneOwner) {
            columns = relation.joinColumns.map((column) => column.referencedColumn!);
            inverseColumns = relation.dataStorage.primaryColumns;
        } else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            columns = relation.inverseRelation!.dataStorage.primaryColumns;
            inverseColumns = relation.inverseRelation!.joinColumns.map(
                (column) => column.referencedColumn!,
            );
        }

        return entities.map((entity) => {
            const group: { entity: E1; related?: E2 | E2[] } = {
                entity: entity,
                related: isMany ? [] : undefined,
            };

            const entityRelationIds = relationIds.filter((relationId) => {
                return inverseColumns.every((column) => {
                    return column.compareEntityValue(
                        entity,
                        relationId[column.dataStorage.name + '_' + column.propertyAliasName],
                    );
                });
            });
            if (!entityRelationIds.length) return group;

            relatedEntities.forEach((relatedEntity) => {
                entityRelationIds.forEach((relationId) => {
                    const relatedEntityMatched = columns.every((column) => {
                        return column.compareEntityValue(
                            relatedEntity,
                            relationId[
                                ConnectorBuilder.buildAlias(
                                    this.connection.connector,
                                    undefined,
                                    column.dataStorage.name +
                                        '_' +
                                        relation.propertyPath.replace('.', '_') +
                                        '_' +
                                        column.propertyPath.replace('.', '_'),
                                )
                            ],
                        );
                    });
                    if (relatedEntityMatched) {
                        if (isMany) {
                            (group.related as E2[]).push(relatedEntity);
                        } else {
                            group.related = relatedEntity;
                        }
                    }
                });
            });
            return group;
        });
    }

    protected loadForManyToMany(
        relation: RelationDataStorage,
        entities: ObjectIndexType[],
        relatedEntities?: ObjectIndexType[],
    ) {
        const junctionMetadata = relation.junctionDataStorage!;
        const mainAlias = junctionMetadata.name;
        const columns = relation.isOwning
            ? junctionMetadata.ownerColumns
            : junctionMetadata.inverseColumns;
        const inverseColumns = relation.isOwning
            ? junctionMetadata.inverseColumns
            : junctionMetadata.ownerColumns;
        const qb = this.connection.createQueryBuilder(this.queryRunner);

        columns.forEach((column) => {
            const columnName = ConnectorBuilder.buildAlias(
                this.connection.connector,
                undefined,
                column.referencedColumn!.dataStorage.name +
                    '_' +
                    column.referencedColumn!.propertyPath.replace('.', '_'),
            );
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });
        inverseColumns.forEach((column) => {
            const columnName = ConnectorBuilder.buildAlias(
                this.connection.connector,
                undefined,
                column.referencedColumn!.dataStorage.name +
                    '_' +
                    relation.propertyPath.replace('.', '_') +
                    '_' +
                    column.referencedColumn!.propertyPath.replace('.', '_'),
            );
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });

        let condition1 = '';
        if (columns.length === 1) {
            const values = entities.map((entity) =>
                columns[0].referencedColumn!.getEntityValue(entity),
            );
            const areAllNumbers = values.every((value) => typeof value === 'number');

            if (areAllNumbers) {
                condition1 = `${mainAlias}.${columns[0].propertyPath} IN (${values.join(', ')})`;
            } else {
                qb.setParam('values1', values);
                condition1 = mainAlias + '.' + columns[0].propertyPath + ' IN (:...values1)';
            }
        } else {
            condition1 =
                '(' +
                entities
                    .map((entity, entityIndex) => {
                        return columns
                            .map((column) => {
                                const paramName =
                                    'entity1_' + entityIndex + '_' + column.propertyName;
                                qb.setParam(
                                    paramName,
                                    column.referencedColumn!.getEntityValue(entity),
                                );
                                return mainAlias + '.' + column.propertyPath + ' = :' + paramName;
                            })
                            .join(' AND ');
                    })
                    .map((condition) => '(' + condition + ')')
                    .join(' OR ') +
                ')';
        }

        let condition2 = '';
        if (relatedEntities) {
            if (inverseColumns.length === 1) {
                const values = relatedEntities.map((entity) =>
                    inverseColumns[0].referencedColumn!.getEntityValue(entity),
                );
                const areAllNumbers = values.every((value) => typeof value === 'number');

                if (areAllNumbers) {
                    condition2 = `${mainAlias}.${inverseColumns[0].propertyPath} IN (${values.join(
                        ', ',
                    )})`;
                } else {
                    qb.setParam('values2', values);
                    condition2 =
                        mainAlias + '.' + inverseColumns[0].propertyPath + ' IN (:...values2)';
                }
            } else {
                condition2 =
                    '(' +
                    relatedEntities
                        .map((entity, entityIndex) => {
                            return inverseColumns
                                .map((column) => {
                                    const paramName =
                                        'entity2_' + entityIndex + '_' + column.propertyName;
                                    qb.setParam(
                                        paramName,
                                        column.referencedColumn!.getEntityValue(entity),
                                    );
                                    return (
                                        mainAlias + '.' + column.propertyPath + ' = :' + paramName
                                    );
                                })
                                .join(' AND ');
                        })
                        .map((condition) => '(' + condition + ')')
                        .join(' OR ') +
                    ')';
            }
        }
        const condition = [condition1, condition2].filter((v) => v.length > 0).join(' AND ');
        return qb.from(junctionMetadata.target, mainAlias).where(condition).getRawMany();
    }

    protected loadForManyToOneAndOneToOneOwner(
        relation: RelationDataStorage,
        entities: ObjectIndexType[],
        relatedEntities?: ObjectIndexType[],
    ) {
        const mainAlias = relation.dataStorage.targetName;
        const hasAllJoinColumnsInEntity = relation.joinColumns.every((joinColumn) => {
            return !!relation.dataStorage.nonVirtualColumns.find((column) => column === joinColumn);
        });
        if (relatedEntities && hasAllJoinColumnsInEntity) {
            const relationIdMaps: ObjectIndexType[] = [];
            entities.forEach((entity) => {
                const relationIdMap: ObjectIndexType = {};

                relation.dataStorage.primaryColumns.forEach((primaryColumn) => {
                    const key =
                        primaryColumn.dataStorage.name +
                        '_' +
                        primaryColumn.propertyPath.replace('.', '_');
                    relationIdMap[key] = primaryColumn.getEntityValue(entity);
                });

                relatedEntities.forEach((relatedEntity) => {
                    relation.joinColumns.forEach((joinColumn) => {
                        const entityColumnValue = joinColumn.getEntityValue(entity);
                        const relatedEntityColumnValue =
                            joinColumn.referencedColumn!.getEntityValue(relatedEntity);
                        if (
                            entityColumnValue === undefined ||
                            relatedEntityColumnValue === undefined
                        )
                            return;

                        if (entityColumnValue === relatedEntityColumnValue) {
                            const key =
                                joinColumn.referencedColumn!.dataStorage.name +
                                '_' +
                                relation.propertyPath.replace('.', '_') +
                                '_' +
                                joinColumn.referencedColumn!.propertyPath.replace('.', '_');
                            relationIdMap[key] = relatedEntityColumnValue;
                        }
                    });
                });
                if (
                    Object.keys(relationIdMap).length ===
                    relation.entityMetadata.primaryColumns.length + relation.joinColumns.length
                ) {
                    relationIdMaps.push(relationIdMap);
                }
            });
            if (relationIdMaps.length === entities.length) return Promise.resolve(relationIdMaps);
        }

        const qb = this.connection.createQueryBuilder(this.queryRunner);
        relation.dataStorage.primaryColumns.forEach((primaryColumn) => {
            const columnName = ConnectorBuilder.buildAlias(
                this.connection.connector,
                undefined,
                primaryColumn.dataStorage.name + '_' + primaryColumn.propertyPath.replace('.', '_'),
            );
            qb.addSelect(mainAlias + '.' + primaryColumn.propertyPath, columnName);
        });
        relation.joinColumns.forEach((column) => {
            const columnName = ConnectorBuilder.buildAlias(
                this.connection.connector,
                undefined,
                column.referencedColumn!.dataStorage.name +
                    '_' +
                    relation.propertyPath.replace('.', '_') +
                    '_' +
                    column.referencedColumn!.propertyPath.replace('.', '_'),
            );
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });

        let condition: string = '';
        if (relation.entityMetadata.primaryColumns.length === 1) {
            const values = entities.map((entity) =>
                relation.entityMetadata.primaryColumns[0].getEntityValue(entity),
            );
            const areAllNumbers = values.every((value) => typeof value === 'number');

            if (areAllNumbers) {
                condition = `${mainAlias}.${
                    relation.entityMetadata.primaryColumns[0].propertyPath
                } IN (${values.join(', ')})`;
            } else {
                qb.setParam('values', values);
                condition =
                    mainAlias +
                    '.' +
                    relation.entityMetadata.primaryColumns[0].propertyPath +
                    ' IN (:...values)';
            }
        } else {
            condition = entities
                .map((entity, entityIndex) => {
                    return relation.dataStorage.primaryColumns
                        .map((column, columnIndex) => {
                            const paramName = 'entity' + entityIndex + '_' + columnIndex;
                            qb.setParam(paramName, column.getEntityValue(entity));
                            return mainAlias + '.' + column.propertyPath + ' = :' + paramName;
                        })
                        .join(' AND ');
                })
                .map((condition) => '(' + condition + ')')
                .join(' OR ');
        }

        return qb.from(relation.entityMetadata.target, mainAlias).where(condition).getRawMany();
    }

    protected loadForOneToManyAndOneToOneNotOwner(
        relation: RelationDataStorage,
        entities: ObjectIndexType[],
        _relatedEntities?: ObjectIndexType[],
    ) {
        relation = relation.inverseRelation!;

        if (relation.entityMetadata.primaryColumns.length === relation.joinColumns.length) {
            const sameReferencedColumns = relation.dataStorage.primaryColumns.every((column) => {
                return relation.joinColumns.indexOf(column) !== -1;
            });
            if (sameReferencedColumns) {
                return Promise.resolve(
                    entities.map((entity) => {
                        const result: ObjectIndexType = {};
                        relation.joinColumns.forEach(function (joinColumn) {
                            const value = joinColumn.referencedColumn!.getEntityValue(entity);
                            const joinColumnName =
                                joinColumn.referencedColumn!.dataStorage.name +
                                '_' +
                                joinColumn.referencedColumn!.propertyPath.replace('.', '_');
                            const primaryColumnName =
                                joinColumn.dataStorage.name +
                                '_' +
                                relation.inverseRelation!.propertyPath.replace('.', '_') +
                                '_' +
                                joinColumn.propertyPath.replace('.', '_');
                            result[joinColumnName] = value;
                            result[primaryColumnName] = value;
                        });
                        return result;
                    }),
                );
            }
        }

        const mainAlias = relation.entityMetadata.targetName;

        // select all columns we need
        const qb = this.connection.createQueryBuilder(this.queryRunner);
        relation.dataStorage.primaryColumns.forEach((primaryColumn) => {
            const columnName = ConnectorBuilder.buildAlias(
                this.connection.connector,
                undefined,
                primaryColumn.dataStorage.name +
                    '_' +
                    relation.inverseRelation!.propertyPath.replace('.', '_') +
                    '_' +
                    primaryColumn.propertyPath.replace('.', '_'),
            );
            qb.addSelect(mainAlias + '.' + primaryColumn.propertyPath, columnName);
        });
        relation.joinColumns.forEach((column) => {
            const columnName = ConnectorBuilder.buildAlias(
                this.connection.connector,
                undefined,
                column.referencedColumn!.dataStorage.name +
                    '_' +
                    column.referencedColumn!.propertyPath.replace('.', '_'),
            );
            qb.addSelect(mainAlias + '.' + column.propertyPath, columnName);
        });

        let condition: string = '';
        if (relation.joinColumns.length === 1) {
            const values = entities.map((entity) =>
                relation.joinColumns[0].referencedColumn!.getEntityValue(entity),
            );
            const areAllNumbers = values.every((value) => typeof value === 'number');

            if (areAllNumbers) {
                condition = `${mainAlias}.${relation.joinColumns[0].propertyPath} IN (${values.join(
                    ', ',
                )})`;
            } else {
                qb.setParam('values', values);
                condition =
                    mainAlias + '.' + relation.joinColumns[0].propertyPath + ' IN (:...values)';
            }
        } else {
            condition = entities
                .map((entity, entityIndex) => {
                    return relation.joinColumns
                        .map((joinColumn, joinColumnIndex) => {
                            const paramName = 'entity' + entityIndex + '_' + joinColumnIndex;
                            qb.setParam(
                                paramName,
                                joinColumn.referencedColumn!.getEntityValue(entity),
                            );
                            return mainAlias + '.' + joinColumn.propertyPath + ' = :' + paramName;
                        })
                        .join(' AND ');
                })
                .map((condition) => '(' + condition + ')')
                .join(' OR ');
        }

        return qb.from(relation.entityMetadata.target, mainAlias).where(condition).getRawMany();
    }
}
