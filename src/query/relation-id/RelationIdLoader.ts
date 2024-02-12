/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConnectorBuilder } from '../../connector/ConnectorBuilder';
import { CQError } from '../../error/CQError';
import { Manager } from '../../manager/Manager';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { CQUtil } from '../../utils/CQUtil';
import { RelationIdAttribute } from '../RelationIdAttribute';
import { QueryExecutor } from '../executor/QueryExecutor';
import { RelationIdLoadResult } from './RelationIdLoadResult';

/**
 * `RelationIdLoader.ts`
 */
export class RelationIdLoader {
    readonly _instance = Symbol.for('RelationIdLoader');

    constructor(
        protected manager: Manager,
        protected queryExecutor: QueryExecutor | undefined,
        protected relationIdAttributes: RelationIdAttribute[],
    ) {}

    async load(rawEntities: any[]): Promise<RelationIdLoadResult[]> {
        const promises = this.relationIdAttributes.map(async (relationIdAttr) => {
            if (relationIdAttr.relation.isManyToOne || relationIdAttr.relation.isOneToOneOwner) {
                if (relationIdAttr.queryBuilderFactory) {
                    throw new CQError(
                        'Additional condition can not be used with ManyToOne or OneToOne owner relations.',
                    );
                }

                const duplicates: { [duplicateKey: string]: boolean } = {};
                const results = rawEntities
                    .map((rawEntity) => {
                        const result: ObjectIndexType = {};
                        const duplicateParts: Array<string> = [];

                        relationIdAttr.relation.joinColumns.forEach((joinColumn) => {
                            result[joinColumn.databaseName] =
                                this.manager.connector.prepareHydratedValue(
                                    rawEntity[
                                        ConnectorBuilder.buildAlias(
                                            this.manager.connector,
                                            undefined,
                                            relationIdAttr.parentAlias,
                                            joinColumn.databaseName,
                                        )
                                    ],
                                    joinColumn.referencedColumn!,
                                );
                            const duplicatePart = `${joinColumn.databaseName}:${
                                result[joinColumn.databaseName]
                            }`;

                            if (duplicateParts.indexOf(duplicatePart) === -1) {
                                duplicateParts.push(duplicatePart);
                            }
                        });

                        relationIdAttr.relation.dataStorage.primaryColumns.forEach(
                            (primaryColumn) => {
                                result[primaryColumn.databaseName] =
                                    this.manager.connector.prepareHydratedValue(
                                        rawEntity[
                                            ConnectorBuilder.buildAlias(
                                                this.manager.connector,
                                                undefined,
                                                relationIdAttr.parentAlias,
                                                primaryColumn.databaseName,
                                            )
                                        ],
                                        primaryColumn,
                                    );
                                const duplicatePart = `${primaryColumn.databaseName}:${
                                    result[primaryColumn.databaseName]
                                }`;

                                if (duplicateParts.indexOf(duplicatePart) === -1) {
                                    duplicateParts.push(duplicatePart);
                                }
                            },
                        );

                        duplicateParts.sort();
                        const duplicate = duplicateParts.join('::');

                        if (duplicates[duplicate]) {
                            return null;
                        }

                        duplicates[duplicate] = true;

                        return result;
                    })
                    .filter((v) => v);

                return {
                    relationIdAttribute: relationIdAttr,
                    results: results,
                };
            } else if (
                relationIdAttr.relation.isOneToMany ||
                relationIdAttr.relation.isOneToOneNotOwner
            ) {
                const relation = relationIdAttr.relation;
                const joinColumns = relation.isOwning
                    ? relation.joinColumns
                    : relation.inverseRelation!.joinColumns;
                const table = relation.inverseDataStorage.target;
                const tableName = relation.inverseDataStorage.tableName;
                const tableAlias = relationIdAttr.alias || tableName;

                const duplicates: { [duplicateKey: string]: boolean } = {};
                const parameters: ObjectIndexType = {};
                const condition = rawEntities
                    .map((rawEntity, index) => {
                        const duplicateParts: Array<string> = [];
                        const parameterParts: ObjectIndexType = {};
                        const queryPart = joinColumns
                            .map((joinColumn) => {
                                const parameterName = joinColumn.databaseName + index;
                                const parameterValue =
                                    rawEntity[
                                        ConnectorBuilder.buildAlias(
                                            this.manager.connector,
                                            undefined,
                                            relationIdAttr.parentAlias,
                                            joinColumn.referencedColumn!.databaseName,
                                        )
                                    ];
                                const duplicatePart = `${tableAlias}:${joinColumn.propertyPath}:${parameterValue}`;

                                if (duplicateParts.indexOf(duplicatePart) !== -1) {
                                    return '';
                                }

                                duplicateParts.push(duplicatePart);
                                parameterParts[parameterName] = parameterValue;

                                return (
                                    tableAlias +
                                    '.' +
                                    joinColumn.propertyPath +
                                    ' = :' +
                                    parameterName
                                );
                            })
                            .filter((v) => v)
                            .join(' AND ');
                        duplicateParts.sort();
                        const duplicate = duplicateParts.join('::');
                        if (duplicates[duplicate]) {
                            return '';
                        }
                        duplicates[duplicate] = true;
                        Object.assign(parameters, parameterParts);
                        return queryPart;
                    })
                    .filter((v) => v)
                    .map((condition) => '(' + condition + ')')
                    .join(' OR ');

                if (!condition) {
                    return {
                        relationIdAttribute: relationIdAttr,
                        results: [],
                    };
                }

                const qb = this.manager.createQueryBuilder(this.queryExecutor);

                const columns = CQUtil.uniq(
                    [...joinColumns, ...relation.inverseRelation!.dataStorage.primaryColumns],
                    (column) => column.propertyPath,
                );

                columns.forEach((joinColumn) => {
                    qb.addSelect(
                        tableAlias + '.' + joinColumn.propertyPath,
                        joinColumn.databaseName,
                    );
                });

                qb.from(table, tableAlias)
                    .where('(' + condition + ')')
                    .setParams(parameters);

                if (relationIdAttr.queryBuilderFactory) {
                    relationIdAttr.queryBuilderFactory(qb);
                }

                const results = await qb.getRawMany();

                results.forEach((result) => {
                    joinColumns.forEach((column) => {
                        result[column.databaseName] = this.manager.connector.prepareHydratedValue(
                            result[column.databaseName],
                            column.referencedColumn!,
                        );
                    });
                    relation.inverseRelation!.dataStorage.primaryColumns.forEach((column) => {
                        result[column.databaseName] = this.manager.connector.prepareHydratedValue(
                            result[column.databaseName],
                            column,
                        );
                    });
                });

                return {
                    relationIdAttribute: relationIdAttr,
                    results,
                };
            } else {
                const relation = relationIdAttr.relation;
                const joinColumns = relation.isOwning
                    ? relation.joinColumns
                    : relation.inverseRelation!.inverseJoinColumns;
                const inverseJoinColumns = relation.isOwning
                    ? relation.inverseJoinColumns
                    : relation.inverseRelation!.joinColumns;
                const junctionAlias = relationIdAttr.junctionAlias;
                const inverseSideTableName = relationIdAttr.joinInverseSideDataStorage.tableName;
                const inverseSideTableAlias = relationIdAttr.alias || inverseSideTableName;
                const junctionTableName = relation.isOwning
                    ? relation.junctionDataStorage!.tableName
                    : relation.inverseRelation!.junctionDataStorage!.tableName;

                const mappedColumns = rawEntities.map((rawEntity) => {
                    return joinColumns.reduce((map, joinColumn) => {
                        map[joinColumn.propertyPath] =
                            rawEntity[
                                ConnectorBuilder.buildAlias(
                                    this.manager.connector,
                                    undefined,
                                    relationIdAttr.parentAlias,
                                    joinColumn.referencedColumn!.databaseName,
                                )
                            ];
                        return map;
                    }, {} as ObjectIndexType);
                });

                if (mappedColumns.length === 0)
                    return {
                        relationIdAttribute: relationIdAttr,
                        results: [],
                    };

                const parameters: ObjectIndexType = {};
                const duplicates: { [duplicateKey: string]: boolean } = {};
                const joinColumnConditions = mappedColumns
                    .map((mappedColumn, index) => {
                        const duplicateParts: Array<string> = [];
                        const parameterParts: ObjectIndexType = {};
                        const queryPart = Object.keys(mappedColumn)
                            .map((key) => {
                                const parameterName = key + index;
                                const parameterValue = mappedColumn[key];
                                const duplicatePart = `${junctionAlias}:${key}:${parameterValue}`;

                                if (duplicateParts.indexOf(duplicatePart) !== -1) {
                                    return '';
                                }

                                duplicateParts.push(duplicatePart);
                                parameterParts[parameterName] = parameterValue;

                                return junctionAlias + '.' + key + ' = :' + parameterName;
                            })
                            .filter((s) => s)
                            .join(' AND ');
                        duplicateParts.sort();
                        const duplicate = duplicateParts.join('::');

                        if (duplicates[duplicate]) {
                            return '';
                        }

                        duplicates[duplicate] = true;
                        Object.assign(parameters, parameterParts);

                        return queryPart;
                    })
                    .filter((s) => s);

                const inverseJoinColumnCondition = inverseJoinColumns
                    .map((joinColumn) => {
                        return (
                            junctionAlias +
                            '.' +
                            joinColumn.propertyPath +
                            ' = ' +
                            inverseSideTableAlias +
                            '.' +
                            joinColumn.referencedColumn!.propertyPath
                        );
                    })
                    .join(' AND ');

                const condition = joinColumnConditions
                    .map((condition) => {
                        return '(' + condition + ' AND ' + inverseJoinColumnCondition + ')';
                    })
                    .join(' OR ');

                const qb = this.manager.createQueryBuilder(this.queryExecutor);

                inverseJoinColumns.forEach((joinColumn) => {
                    qb.addSelect(
                        junctionAlias + '.' + joinColumn.propertyPath,
                        joinColumn.databaseName,
                    ).addOrderBy(junctionAlias + '.' + joinColumn.propertyPath);
                });

                joinColumns.forEach((joinColumn) => {
                    qb.addSelect(
                        junctionAlias + '.' + joinColumn.propertyPath,
                        joinColumn.databaseName,
                    ).addOrderBy(junctionAlias + '.' + joinColumn.propertyPath);
                });

                qb.from(inverseSideTableName, inverseSideTableAlias)
                    .innerJoin(junctionTableName, junctionAlias, condition)
                    .setParams(parameters);

                if (relationIdAttr.queryBuilderFactory) {
                    relationIdAttr.queryBuilderFactory(qb);
                }

                const results = await qb.getRawMany();
                results.forEach((result) => {
                    [...joinColumns, ...inverseJoinColumns].forEach((column) => {
                        result[column.databaseName] = this.manager.connector.prepareHydratedValue(
                            result[column.databaseName],
                            column.referencedColumn!,
                        );
                    });
                });

                return {
                    relationIdAttribute: relationIdAttr,
                    results,
                };
            }
        });

        return Promise.all(promises) as any;
    }
}
export { RelationIdAttribute };
