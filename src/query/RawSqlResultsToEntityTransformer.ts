/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConnectorBuilder } from '../connector/ConnectorBuilder';
import { Manager } from '../manager/Manager';
import { CQDataStorage } from '../storage/CQDataStorage';
import { RelationDataStorage } from '../storage/RelationDataStorage';
import { ColumnDataStorage } from '../storage/column/ColumnDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { CQUtil } from '../utils/CQUtil';
import { ObjectUtil } from '../utils/ObjectUtil';
import { AsSyntax } from './AsSyntax';
import { QueryExpression } from './QueryExpression';
import { QueryExecutor } from './executor/QueryExecutor';
import { RelationCountLoadResult } from './relation-count/RelationCountLoadResult';
import { RelationIdLoadResult } from './relation-id/RelationIdLoadResult';

/**
 * `RawSqlResultsToEntityTransformer.ts`
 */
export class RawSqlResultsToEntityTransformer {
    private relationIdMaps: Array<{ [idHash: string]: any[] }>;

    constructor(
        protected expressionMap: QueryExpression,
        protected driver: Manager,
        protected rawRelationIdResults: RelationIdLoadResult[],
        protected rawRelationCountResults: RelationCountLoadResult[],
        protected queryRunner?: QueryExecutor,
    ) {}

    transform(rawResults: any[], alias: AsSyntax): any[] {
        const group = this.group(rawResults, alias);
        const entities: any[] = [];
        group.forEach((results) => {
            const entity = this.transformRawResultsGroup(results, alias);
            if (entity !== undefined && !Object.values(entity).every((value) => value === null))
                entities.push(entity);
        });
        return entities;
    }

    protected group(rawResults: any[], alias: AsSyntax): Map<string, any[]> {
        const map = new Map();
        const keys: string[] = [];
        if ((alias.dataStorage as CQDataStorage).tableType === 'view') {
            keys.push(
                ...(alias.dataStorage as CQDataStorage).columns.map((column) =>
                    ConnectorBuilder.buildAlias(
                        this.driver.connector,
                        undefined,
                        alias.name,
                        column.databaseName,
                    ),
                ),
            );
        } else {
            keys.push(
                ...(alias.dataStorage as CQDataStorage).primaryColumns.map((column) =>
                    ConnectorBuilder.buildAlias(
                        this.driver.connector,
                        undefined,
                        alias.name,
                        column.databaseName,
                    ),
                ),
            );
        }
        rawResults.forEach((rawResult) => {
            const id = keys
                .map((key) => {
                    const keyValue = rawResult[key];

                    if (Buffer.isBuffer(keyValue)) {
                        return keyValue.toString('hex');
                    }

                    if (ObjectUtil.isObject(keyValue)) {
                        return JSON.stringify(keyValue);
                    }

                    return keyValue;
                })
                .join('_');

            const items = map.get(id);
            if (!items) {
                map.set(id, [rawResult]);
            } else {
                items.push(rawResult);
            }
        });
        return map;
    }

    protected transformRawResultsGroup(
        rawResults: any[],
        alias: AsSyntax,
    ): ObjectIndexType | undefined {
        let metadata = alias.dataStorage as CQDataStorage;

        if (metadata.discriminatorColumn) {
            const discriminatorValues = rawResults.map(
                (result) =>
                    result[
                        ConnectorBuilder.buildAlias(
                            this.driver.connector,
                            undefined,
                            alias.name,
                            (alias.dataStorage as CQDataStorage).discriminatorColumn!.databaseName,
                        )
                    ],
            );
            const discriminatorMetadata = metadata.childCQDataStorages.find(
                (childEntityMetadata) => {
                    return (
                        typeof discriminatorValues.find(
                            (value) => value === childEntityMetadata.discriminatorValue,
                        ) !== 'undefined'
                    );
                },
            );
            if (discriminatorMetadata) metadata = discriminatorMetadata;
        }
        const entity: any = metadata.create(this.queryRunner as QueryExecutor, {
            fromDeserializer: true,
            pojo: this.expressionMap.options.indexOf('create-pojo') !== -1,
        });

        const hasColumns = this.transformColumns(rawResults, alias, entity, metadata);
        const hasRelations = this.transformJoins(rawResults, entity, alias, metadata);
        const hasRelationIds = this.transformRelationIds(rawResults, alias, entity, metadata);
        const hasRelationCounts = this.transformRelationCounts(rawResults, alias, entity);

        if (hasColumns) return entity;

        const hasOnlyVirtualPrimaryColumns =
            metadata.primaryColumns.filter((column) => column.isVirtual === false).length === 0;
        if (hasOnlyVirtualPrimaryColumns && (hasRelations || hasRelationIds || hasRelationCounts))
            return entity;

        return undefined;
    }

    protected transformColumns(
        rawResults: any[],
        alias: AsSyntax,
        entity: ObjectIndexType,
        metadata: CQDataStorage,
    ): boolean {
        let hasData = false;
        metadata.columns.forEach((column) => {
            if (
                metadata.childCQDataStorages.length > 0 &&
                metadata.childCQDataStorages.findIndex(
                    (childMetadata) => childMetadata.target === column.target,
                ) !== -1
            )
                return;

            const value =
                rawResults[0][
                    ConnectorBuilder.buildAlias(
                        this.driver.connector,
                        undefined,
                        alias.name,
                        column.databaseName,
                    )
                ];
            if (value === undefined || column.isVirtual) return;

            if (
                !this.expressionMap.selects.find(
                    (select) =>
                        select.select === alias.name ||
                        select.select === alias.name + '.' + column.propertyPath,
                )
            )
                return;

            column.setEntityValue(
                entity,
                this.driver.connector.prepareHydratedValue(value, column),
            );
            if (value !== null) hasData = true;
        });
        if (entity) {
            metadata.embeddeds.forEach((embedded) => {
                if (embedded.propertyName in entity) {
                    entity[embedded.propertyName] = this.deeplyNullify(
                        entity[embedded.propertyName],
                    );
                }
            });
        }
        return hasData;
    }

    private isIterrableObject(obj: any): obj is object {
        const prototype = Object.prototype.toString.call(obj);
        return prototype === '[object Object]' || prototype === '[object Array]';
    }

    private deeplyNullify<T>(obj: T): T | null {
        if (!this.isIterrableObject(obj)) return obj;

        for (const key in obj) {
            obj[key] = this.deeplyNullify(obj[key] as any);
        }
        const nullify = Object.values(obj).every((value) => value == null);
        return nullify ? null : obj;
    }

    protected transformJoins(
        rawResults: any[],
        entity: ObjectIndexType,
        alias: AsSyntax,
        metadata: CQDataStorage,
    ) {
        let hasData = false;

        this.expressionMap.joinAttributes.forEach((join) => {
            if (!join.dataStorage) return;

            if (!join.isSelected) return;

            if (join.relation && !metadata.relations.find((relation) => relation === join.relation))
                return;

            if (join.mapToProperty) {
                if (join.mapToPropertyParentAlias !== alias.name) return;
            } else {
                if (
                    !join.relation ||
                    join.parentAlias !== alias.name ||
                    join.relationPropertyPath !== join.relation!.propertyPath
                )
                    return;
            }

            let result: any = this.transform(rawResults, join.alias);
            result = !join.isMany ? result[0] : result;
            result = !join.isMany && result === undefined ? null : result;
            if (result === undefined) return;

            if (join.mapToPropertyPropertyName) {
                entity[join.mapToPropertyPropertyName] = result;
            } else {
                join.relation!.setEntityValue(entity, result);
            }

            hasData = true;
        });
        return hasData;
    }

    protected transformRelationIds(
        rawSqlResults: any[],
        alias: AsSyntax,
        entity: ObjectIndexType,
        _metadata: CQDataStorage,
    ): boolean {
        let hasData = false;
        this.rawRelationIdResults.forEach((rawRelationIdResult, index) => {
            if (rawRelationIdResult.relationIdAttribute.parentAlias !== alias.name) return;

            const relation = rawRelationIdResult.relationIdAttribute.relation;
            const valueMap = this.createValueMapFromJoinColumns(
                relation,
                rawRelationIdResult.relationIdAttribute.parentAlias,
                rawSqlResults,
            );
            if (valueMap === undefined || valueMap === null) {
                return;
            }

            this.prepareDataForTransformRelationIds();

            const hash = this.hashEntityIds(relation, valueMap);
            const idMaps = this.relationIdMaps[index][hash] || [];

            const properties =
                rawRelationIdResult.relationIdAttribute.mapToPropertyPropertyPath.split('.');
            const mapToProperty = (properties: string[], map: ObjectIndexType, value: any): any => {
                const property = properties.shift();
                if (property && properties.length === 0) {
                    map[property] = value;
                    return map;
                }
                if (property && properties.length > 0) {
                    mapToProperty(properties, map[property], value);
                } else {
                    return map;
                }
            };
            if (relation.isOneToOne || relation.isManyToOne) {
                if (idMaps[0] !== undefined) {
                    mapToProperty(properties, entity, idMaps[0]);
                    hasData = true;
                }
            } else {
                mapToProperty(properties, entity, idMaps);
                hasData = hasData || idMaps.length > 0;
            }
        });

        return hasData;
    }

    protected transformRelationCounts(
        rawSqlResults: any[],
        alias: AsSyntax,
        entity: ObjectIndexType,
    ): boolean {
        let hasData = false;
        this.rawRelationCountResults
            .filter(
                (rawRelationCountResult) =>
                    rawRelationCountResult.relationCountAttribute.parentAlias === alias.name,
            )
            .forEach((rawRelationCountResult) => {
                const relation = rawRelationCountResult.relationCountAttribute.relation;
                let referenceColumnName: string;

                if (relation.isOneToMany) {
                    referenceColumnName =
                        relation.inverseRelation!.joinColumns[0].referencedColumn!.databaseName;
                } else {
                    referenceColumnName = relation.isOwning
                        ? relation.joinColumns[0].referencedColumn!.databaseName
                        : relation.inverseRelation!.joinColumns[0].referencedColumn!.databaseName;
                }

                const referenceColumnValue =
                    rawSqlResults[0][
                        ConnectorBuilder.buildAlias(
                            this.driver.connector,
                            undefined,
                            alias.name,
                            referenceColumnName,
                        )
                    ];
                if (referenceColumnValue !== undefined && referenceColumnValue !== null) {
                    entity[
                        rawRelationCountResult.relationCountAttribute.mapToPropertyPropertyName
                    ] = 0;
                    rawRelationCountResult.results
                        .filter((result) => result['parentId'] === referenceColumnValue)
                        .forEach((result) => {
                            entity[
                                rawRelationCountResult.relationCountAttribute.mapToPropertyPropertyName
                            ] = parseInt(result['cnt']);
                            hasData = true;
                        });
                }
            });

        return hasData;
    }

    private createValueMapFromJoinColumns(
        relation: RelationDataStorage,
        parentAlias: string,
        rawSqlResults: any[],
    ): ObjectIndexType {
        let columns: ColumnDataStorage[];
        if (relation.isManyToOne || relation.isOneToOneOwner) {
            columns = relation.dataStorage.primaryColumns.map((joinColumn) => joinColumn);
        } else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            columns = relation.inverseRelation!.joinColumns.map((joinColumn) => joinColumn);
        } else {
            if (relation.isOwning) {
                columns = relation.joinColumns.map((joinColumn) => joinColumn);
            } else {
                columns = relation.inverseRelation!.inverseJoinColumns.map(
                    (joinColumn) => joinColumn,
                );
            }
        }
        return columns.reduce((valueMap, column) => {
            rawSqlResults.forEach((rawSqlResult) => {
                if (relation.isManyToOne || relation.isOneToOneOwner) {
                    valueMap[column.databaseName] = this.driver.connector.prepareHydratedValue(
                        rawSqlResult[
                            ConnectorBuilder.buildAlias(
                                this.driver.connector,
                                undefined,
                                parentAlias,
                                column.databaseName,
                            )
                        ],
                        column,
                    );
                } else {
                    valueMap[column.databaseName] = this.driver.connector.prepareHydratedValue(
                        rawSqlResult[
                            ConnectorBuilder.buildAlias(
                                this.driver.connector,
                                undefined,
                                parentAlias,
                                column.referencedColumn!.databaseName,
                            )
                        ],
                        column.referencedColumn!,
                    );
                }
            });
            return valueMap;
        }, {} as ObjectIndexType);
    }

    private extractEntityPrimaryIds(relation: RelationDataStorage, relationIdRawResult: any) {
        let columns: ColumnDataStorage[];
        if (relation.isManyToOne || relation.isOneToOneOwner) {
            columns = relation.dataStorage.primaryColumns.map((joinColumn) => joinColumn);
        } else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            columns = relation.inverseRelation!.joinColumns.map((joinColumn) => joinColumn);
        } else {
            if (relation.isOwning) {
                columns = relation.joinColumns.map((joinColumn) => joinColumn);
            } else {
                columns = relation.inverseRelation!.inverseJoinColumns.map(
                    (joinColumn) => joinColumn,
                );
            }
        }
        return columns.reduce((data, column) => {
            data[column.databaseName] = relationIdRawResult[column.databaseName];
            return data;
        }, {} as ObjectIndexType);
    }

    private prepareDataForTransformRelationIds() {
        if (this.relationIdMaps) {
            return;
        }

        this.relationIdMaps = this.rawRelationIdResults.map((rawRelationIdResult) => {
            const relation = rawRelationIdResult.relationIdAttribute.relation;

            let columns: ColumnDataStorage[];
            if (relation.isManyToOne || relation.isOneToOneOwner) {
                columns = relation.joinColumns;
            } else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                columns = relation.inverseDataStorage.primaryColumns;
            } else {
                if (relation.isOwning) {
                    columns = relation.inverseJoinColumns;
                } else {
                    columns = relation.inverseRelation!.joinColumns;
                }
            }

            return rawRelationIdResult.results.reduce((agg, result) => {
                let idMap = columns.reduce((idMap, column) => {
                    let value = result[column.databaseName];
                    if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                        if (
                            column.isVirtual &&
                            column.referencedColumn &&
                            column.referencedColumn.propertyName !== column.propertyName
                        ) {
                            value = column.referencedColumn.createValueMap(value);
                        }

                        return CQUtil.mergeDeep(idMap, column.createValueMap(value));
                    }
                    if (!column.isPrimary && column.referencedColumn!.referencedColumn) {
                        value = column.referencedColumn!.referencedColumn!.createValueMap(value);
                    }

                    return CQUtil.mergeDeep(idMap, column.referencedColumn!.createValueMap(value));
                }, {} as ObjectIndexType);

                if (
                    columns.length === 1 &&
                    !rawRelationIdResult.relationIdAttribute.disableMixedMap
                ) {
                    if (relation.isOneToMany || relation.isOneToOneNotOwner) {
                        idMap = columns[0].getEntityValue(idMap);
                    } else {
                        idMap = columns[0].referencedColumn!.getEntityValue(idMap);
                    }
                }

                if (idMap !== undefined) {
                    const hash = this.hashEntityIds(relation, result);

                    if (agg[hash]) {
                        agg[hash].push(idMap);
                    } else {
                        agg[hash] = [idMap];
                    }
                }

                return agg;
            }, {});
        });
    }

    private hashEntityIds(relation: RelationDataStorage, data: ObjectIndexType) {
        const entityPrimaryIds = this.extractEntityPrimaryIds(relation, data);
        return JSON.stringify(entityPrimaryIds);
    }
}
