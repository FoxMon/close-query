/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */

import { Manager } from '../manager/Manager';
import { CQDataStorage } from '../storage/CQDataStorage';
import { RelationDataStorage } from '../storage/RelationDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { CQUtil } from '../utils/CQUtil';
import { SelectQueryBuilder } from './builder/SelectQueryBuilder';
import { QueryExecutor } from './executor/QueryExecutor';

/**
 * `RelationLoader.ts`
 *
 * Entity의 Relation을 다루는 class를 정의하도록 한다.
 */
export class RelationLoader {
    readonly _instance = Symbol.for('RelationLodaer');

    private manager: Manager;

    constructor(manager: Manager) {
        this.manager = manager;
    }

    load(
        relation: RelationDataStorage,
        entityOrEntities: ObjectIndexType | ObjectIndexType[],
        queryExecutor?: QueryExecutor,
        queryBuilder?: SelectQueryBuilder<any>,
    ): Promise<any[]> {
        if (queryExecutor && queryExecutor.isReleased) {
            queryExecutor = undefined;
        }

        if (relation.isManyToOne || relation.isOneToOneOwner) {
            return this.loadManyToOneOrOneToOneOwner(
                relation,
                entityOrEntities,
                queryExecutor,
                queryBuilder,
            );
        } else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
            return this.loadOneToManyOrOneToOneNotOwner(
                relation,
                entityOrEntities,
                queryExecutor,
                queryBuilder,
            );
        } else if (relation.isManyToManyOwner) {
            return this.loadManyToManyOwner(
                relation,
                entityOrEntities,
                queryExecutor,
                queryBuilder,
            );
        } else {
            return this.loadManyToManyNotOwner(
                relation,
                entityOrEntities,
                queryExecutor,
                queryBuilder,
            );
        }
    }

    loadManyToOneOrOneToOneOwner(
        relation: RelationDataStorage,
        entityOrEntities: ObjectIndexType | ObjectIndexType[],
        queryExecutor?: QueryExecutor,
        queryBuilder?: SelectQueryBuilder<any>,
    ): Promise<any> {
        const entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];

        const joinAliasName = relation.dataStorage.name;
        const qb = queryBuilder
            ? queryBuilder
            : this.manager
                  .createQueryBuilder(queryExecutor)
                  .select(relation.propertyName)
                  .from(relation.type, relation.propertyName);

        const mainAlias = qb.queryExpression.mainAlias!.name;
        const columns = relation.dataStorage.primaryColumns;
        const joinColumns = relation.isOwning
            ? relation.joinColumns
            : relation.inverseRelation!.joinColumns;
        const conditions = joinColumns
            .map((joinColumn) => {
                return `${relation.dataStorage.name}.${joinColumn.propertyName} = ${mainAlias}.${
                    joinColumn.referencedColumn!.propertyName
                }`;
            })
            .join(' AND ');

        qb.innerJoin(relation.dataStorage.target as Function, joinAliasName, conditions);

        if (columns.length === 1) {
            qb.where(
                `${joinAliasName}.${columns[0].propertyPath} IN (:...${
                    joinAliasName + '_' + columns[0].propertyName
                })`,
            );
            qb.setParam(
                joinAliasName + '_' + columns[0].propertyName,
                entities.map((entity) => columns[0].getEntityValue(entity, true)),
            );
        } else {
            const condition = entities
                .map((entity, entityIndex) => {
                    return columns
                        .map((column, columnIndex) => {
                            const paramName =
                                joinAliasName + '_entity_' + entityIndex + '_' + columnIndex;
                            qb.setParam(paramName, column.getEntityValue(entity, true));
                            return joinAliasName + '.' + column.propertyPath + ' = :' + paramName;
                        })
                        .join(' AND ');
                })
                .map((condition) => '(' + condition + ')')
                .join(' OR ');
            qb.where(condition);
        }

        CQUtil.joinEagerRelations(
            qb,
            qb.asSyntax,
            qb.queryExpression.mainAlias!.dataStorage as CQDataStorage,
        );

        return qb.getMany();
    }

    loadOneToManyOrOneToOneNotOwner(
        relation: RelationDataStorage,
        entityOrEntities: ObjectIndexType | ObjectIndexType[],
        queryExecutor?: QueryExecutor,
        queryBuilder?: SelectQueryBuilder<any>,
    ): Promise<any> {
        const entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];
        const columns = relation.inverseRelation!.joinColumns;
        const qb = queryBuilder
            ? queryBuilder
            : this.manager
                  .createQueryBuilder(queryExecutor)
                  .select(relation.propertyName)
                  .from(relation.inverseRelation!.dataStorage.target, relation.propertyName);

        const aliasName = qb.queryExpression.mainAlias!.name;

        if (columns.length === 1) {
            qb.where(
                `${aliasName}.${columns[0].propertyPath} IN (:...${
                    aliasName + '_' + columns[0].propertyName
                })`,
            );
            qb.setParam(
                aliasName + '_' + columns[0].propertyName,
                entities.map((entity) => columns[0].referencedColumn!.getEntityValue(entity, true)),
            );
        } else {
            const condition = entities
                .map((entity, entityIndex) => {
                    return columns
                        .map((column, columnIndex) => {
                            const paramName =
                                aliasName + '_entity_' + entityIndex + '_' + columnIndex;
                            qb.setParam(
                                paramName,
                                column.referencedColumn!.getEntityValue(entity, true),
                            );
                            return aliasName + '.' + column.propertyPath + ' = :' + paramName;
                        })
                        .join(' AND ');
                })
                .map((condition) => '(' + condition + ')')
                .join(' OR ');
            qb.where(condition);
        }

        CQUtil.joinEagerRelations(
            qb,
            qb.asSyntax,
            qb.queryExpression.mainAlias!.dataStorage as CQDataStorage,
        );

        return qb.getMany();
    }

    loadManyToManyOwner(
        relation: RelationDataStorage,
        entityOrEntities: ObjectIndexType | ObjectIndexType[],
        queryExecutor?: QueryExecutor,
        queryBuilder?: SelectQueryBuilder<any>,
    ): Promise<any> {
        const entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];
        const parameters = relation.joinColumns.reduce((parameters, joinColumn) => {
            parameters[joinColumn.propertyName] = entities.map((entity) =>
                joinColumn.referencedColumn!.getEntityValue(entity, true),
            );
            return parameters;
        }, {} as ObjectIndexType);

        const qb = queryBuilder
            ? queryBuilder
            : this.manager
                  .createQueryBuilder(queryExecutor)
                  .select(relation.propertyName)
                  .from(relation.type, relation.propertyName);

        const mainAlias = qb.queryExpression.mainAlias!.name;
        const joinAlias = relation.junctionDataStorage!.tableName;
        const joinColumnConditions = relation.joinColumns.map((joinColumn) => {
            return `${joinAlias}.${joinColumn.propertyName} IN (:...${joinColumn.propertyName})`;
        });
        const inverseJoinColumnConditions = relation.inverseJoinColumns.map((inverseJoinColumn) => {
            return `${joinAlias}.${inverseJoinColumn.propertyName}=${mainAlias}.${
                inverseJoinColumn.referencedColumn!.propertyName
            }`;
        });

        qb.innerJoin(
            joinAlias,
            joinAlias,
            [...joinColumnConditions, ...inverseJoinColumnConditions].join(' AND '),
        ).setParams(parameters);

        CQUtil.joinEagerRelations(
            qb,
            qb.asSyntax,
            qb.queryExpression.mainAlias!.dataStorage as CQDataStorage,
        );

        return qb.getMany();
    }

    loadManyToManyNotOwner(
        relation: RelationDataStorage,
        entityOrEntities: ObjectIndexType | ObjectIndexType[],
        queryExecutor?: QueryExecutor,
        queryBuilder?: SelectQueryBuilder<any>,
    ): Promise<any> {
        const entities = Array.isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities];

        const qb = queryBuilder
            ? queryBuilder
            : this.manager
                  .createQueryBuilder(queryExecutor)
                  .select(relation.propertyName)
                  .from(relation.type, relation.propertyName);

        const mainAlias = qb.queryExpression.mainAlias!.name;
        const joinAlias = relation.junctionDataStorage!.tableName;
        const joinColumnConditions = relation.inverseRelation!.joinColumns.map((joinColumn) => {
            return `${joinAlias}.${joinColumn.propertyName} = ${mainAlias}.${
                joinColumn.referencedColumn!.propertyName
            }`;
        });
        const inverseJoinColumnConditions = relation.inverseRelation!.inverseJoinColumns.map(
            (inverseJoinColumn) => {
                return `${joinAlias}.${inverseJoinColumn.propertyName} IN (:...${inverseJoinColumn.propertyName})`;
            },
        );
        const parameters = relation.inverseRelation!.inverseJoinColumns.reduce(
            (parameters, joinColumn) => {
                parameters[joinColumn.propertyName] = entities.map((entity) =>
                    joinColumn.referencedColumn!.getEntityValue(entity, true),
                );
                return parameters;
            },
            {} as ObjectIndexType,
        );

        qb.innerJoin(
            joinAlias,
            joinAlias,
            [...joinColumnConditions, ...inverseJoinColumnConditions].join(' AND '),
        ).setParams(parameters);

        CQUtil.joinEagerRelations(
            qb,
            qb.asSyntax,
            qb.queryExpression.mainAlias!.dataStorage as CQDataStorage,
        );

        return qb.getMany();
    }

    enableLazyLoad(
        relation: RelationDataStorage,
        entity: ObjectIndexType,
        queryExecutor?: QueryExecutor,
    ) {
        const relationLoader = this;
        const dataIndex = '__' + relation.propertyName + '__';
        const promiseIndex = '__promise_' + relation.propertyName + '__';
        const resolveIndex = '__has_' + relation.propertyName + '__';

        const setData = (entity: ObjectIndexType, value: any) => {
            entity[dataIndex] = value;
            entity[resolveIndex] = true;
            delete entity[promiseIndex];
            return value;
        };

        const setPromise = (entity: ObjectIndexType, value: Promise<any>) => {
            delete entity[resolveIndex];
            delete entity[dataIndex];
            entity[promiseIndex] = value;
            value.then((result) =>
                entity[promiseIndex] === value ? setData(entity, result) : result,
            );
            return value;
        };

        Object.defineProperty(entity, relation.propertyName, {
            get: function () {
                if (this[resolveIndex] === true || this[dataIndex] !== undefined)
                    return Promise.resolve(this[dataIndex]);

                if (this[promiseIndex]) return this[promiseIndex];

                const loader = relationLoader
                    .load(relation, this, queryExecutor)
                    .then((result) =>
                        relation.isOneToOne || relation.isManyToOne
                            ? result.length === 0
                                ? null
                                : result[0]
                            : result,
                    );
                return setPromise(this, loader);
            },
            set: function (value: any | Promise<any>) {
                if (value instanceof Promise) {
                    setPromise(this, value);
                } else {
                    setData(this, value);
                }
            },
            configurable: true,
            enumerable: false,
        });
    }
}
