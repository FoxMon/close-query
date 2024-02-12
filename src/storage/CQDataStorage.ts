/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { CannotCreateEntityIdMapError } from '../error/CannotCreateEntityidMapError';
import { Manager } from '../manager/Manager';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { CQUtil } from '../utils/CQUtil';
import { ObjectUtil } from '../utils/ObjectUtil';
import { CheckDataStorage } from './CheckDataStorage';
import { DataStorageListener } from './DataStorageListener';
import { EmbeddedDataStorage } from './EmbeddedDataStorage';
import { ExclusionDataStorage } from './ExclusionDataStorage';
import { ForeignKeyDataStorage } from './ForeignKeyDataStorage';
import { RelationCountDataStorage } from './RelationCountDataStorage';
import { RelationDataStorage } from './RelationDataStorage';
import { RelationIdDataStorage } from './RelationIdDataStorage';
import { ColumnDataStorage } from './column/ColumnDataStorage';
import { IndexDataStorage } from './index/IndexDataStorage';
import { UniqueDataStorage } from './unique/UniqueDataStorage';
import { TableType } from './types/TableType';
import { ClosureTreeOption } from './types/ClosureTreeOption';
import { TreeType } from './types/TreeType';
import { TableDataStorageOption } from './table/TableDataStorageOption';
import { TreeDataStorageOption } from './TreeDataStorageOption';
import { QueryExecutor } from '../query/executor/QueryExecutor';
import { OrderByType } from '../types/OrderByType';

/**
 * `CQDataStorage.ts`
 *
 * CQ의 모든 MetaData를 관리하는 Class를 정의하도록 한다.
 */
export class CQDataStorage {
    readonly '_instance' = Symbol.for('CQDataStorage');

    manager: Manager;

    tables: TableDataStorageOption;

    indexes: IndexDataStorage[] = [];

    ownIndexes: IndexDataStorage[] = [];

    name: string;

    schema?: string;

    target: Function | string;

    targetName: string;

    database?: string;

    tableName: string;

    tablePath: string;

    embeddeds: EmbeddedDataStorage[] = [];

    allEmbeddeds: EmbeddedDataStorage[] = [];

    foreignKeys: ForeignKeyDataStorage[] = [];

    relationIds: RelationIdDataStorage[] = [];

    relationCounts: RelationCountDataStorage[] = [];

    ownRelations: RelationDataStorage[] = [];

    relations: RelationDataStorage[] = [];

    eagerRelations: RelationDataStorage[] = [];

    lazyRelations: RelationDataStorage[] = [];

    oneToOneRelations: RelationDataStorage[] = [];

    ownerOneToOneRelations: RelationDataStorage[] = [];

    oneToManyRelations: RelationDataStorage[] = [];

    manyToOneRelations: RelationDataStorage[] = [];

    manyToManyRelations: RelationDataStorage[] = [];

    ownerManyToManyRelations: RelationDataStorage[] = [];

    relationsWithJoinColumns: RelationDataStorage[] = [];

    treeParentRelation?: RelationDataStorage;

    treeChildrenRelation?: RelationDataStorage;

    synchronize: boolean = true;

    columns: ColumnDataStorage[] = [];

    primaryColumns: ColumnDataStorage[] = [];

    materializedPathColumn?: ColumnDataStorage;

    treeLevelColumn?: ColumnDataStorage;

    nestedSetLeftColumn?: ColumnDataStorage;

    nestedSetRightColumn?: ColumnDataStorage;

    ancestorColumns: ColumnDataStorage[] = [];

    descendantColumns: ColumnDataStorage[] = [];

    nonVirtualColumns: ColumnDataStorage[] = [];

    ownerColumns: ColumnDataStorage[] = [];

    inverseColumns: ColumnDataStorage[] = [];

    generatedColumns: ColumnDataStorage[] = [];

    objectIdColumn?: ColumnDataStorage;

    createDateColumn?: ColumnDataStorage;

    updateDateColumn?: ColumnDataStorage;

    deleteDateColumn?: ColumnDataStorage;

    parentCQDataStorage: CQDataStorage;

    discriminatorValue: string;

    hasMultiplePrimaryKeys: boolean = false;

    childCQDataStorages: CQDataStorage[] = [];

    versionColumn?: ColumnDataStorage;

    discriminatorColumn?: ColumnDataStorage;

    expression?: string | ((manager: Manager) => SelectQueryBuilder<any>);

    uniques: UniqueDataStorage[] = [];

    ownUniques: UniqueDataStorage[] = [];

    checks: CheckDataStorage[] = [];

    exclusions: ExclusionDataStorage[] = [];

    ownListeners: DataStorageListener[] = [];

    listeners: DataStorageListener[] = [];

    afterLoadListeners: DataStorageListener[] = [];

    beforeInsertListeners: DataStorageListener[] = [];

    afterInsertListeners: DataStorageListener[] = [];

    beforeUpdateListeners: DataStorageListener[] = [];

    afterUpdateListeners: DataStorageListener[] = [];

    beforeRemoveListeners: DataStorageListener[] = [];

    beforeSoftRemoveListeners: DataStorageListener[] = [];

    beforeRecoverListeners: DataStorageListener[] = [];

    afterRemoveListeners: DataStorageListener[] = [];

    afterSoftRemoveListeners: DataStorageListener[] = [];

    afterRecoverListeners: DataStorageListener[] = [];

    inheritanceTree: Function[] = [];

    tableType: TableType = 'regular';

    dependsOn?: Set<Function | string>;

    withoutRowid?: boolean = false;

    treeOptions?: ClosureTreeOption;

    inheritancePattern?: 'STI';

    parentClosureDataStorage?: CQDataStorage;

    treeType?: TreeType;

    isAlwaysUsingConstructor: boolean = true;

    propertiesMap: ObjectIndexType;

    isJunction: boolean = false;

    orderBy?: OrderByType;

    constructor(options: {
        manager: Manager;
        inheritanceTree?: Function[];
        inheritancePattern?: 'STI';
        tableTree?: TreeDataStorageOption;
        parentClosureDataStorage?: CQDataStorage;
        args: TableDataStorageOption;
    }) {
        this.manager = options.manager;
        this.inheritanceTree = options.inheritanceTree || [];
        this.inheritancePattern = options.inheritancePattern;
        this.treeType = options.tableTree ? options.tableTree.type : undefined;
        this.treeOptions = options.tableTree ? options.tableTree.options : undefined;
        this.parentClosureDataStorage = options.parentClosureDataStorage!;
        this.tables = options.args;
        this.target = this.tables.target;
        this.tableType = this.tables.type;
        this.expression = this.tables.expression;
        this.withoutRowid = this.tables.withoutRowid;
        this.dependsOn = this.tables.dependsOn;
    }

    create(
        queryExecutor: QueryExecutor,
        options?: { fromDeserializer?: boolean; pojo?: boolean },
    ): any {
        const pojo = options && options.pojo === true ? true : false;

        let ret: any;

        if (typeof this.target === 'function' && !pojo) {
            if (!options?.fromDeserializer || this.isAlwaysUsingConstructor) {
                ret = new (<any>this.target)();
            } else {
                ret = Object.create(this.target.prototype);
            }
        } else {
            ret = {};
        }

        if (this.manager.options.typename) {
            ret[this.manager.options.typename] = this.targetName;
        }

        this.lazyRelations.forEach((relation) =>
            this.manager.relationLoader.enableLazyLoad(relation, ret, queryExecutor),
        );
        return ret;
    }

    findRelationWithPropertyPath(propertyPath: string): RelationDataStorage | undefined {
        return this.relations.find((relation) => relation.propertyPath === propertyPath);
    }

    findEmbeddedWithPropertyPath(propertyPath: string): EmbeddedDataStorage | undefined {
        return this.allEmbeddeds.find((embedded) => embedded.propertyPath === propertyPath);
    }

    findColumnsWithPropertyPath(propertyPath: string): ColumnDataStorage[] {
        const column = this.columns.find((column) => column.propertyPath === propertyPath);

        if (column) {
            return [column];
        }

        const relation = this.findRelationWithPropertyPath(propertyPath);

        if (relation && relation.joinColumns) {
            return relation.joinColumns;
        }

        const embedded = this.findEmbeddedWithPropertyPath(propertyPath);

        if (embedded) return embedded.columns;

        return [];
    }

    findColumnWithDatabaseName(databaseName: string): ColumnDataStorage | undefined {
        return this.columns.find((column) => column.databaseName === databaseName);
    }

    findColumnWithPropertyPath(propertyPath: string): ColumnDataStorage | undefined {
        const column = this.columns.find((column) => column.propertyPath === propertyPath);

        if (column) {
            return column;
        }

        const relation = this.relations.find((relation) => relation.propertyPath === propertyPath);

        if (relation && relation.joinColumns.length === 1) {
            return relation.joinColumns[0];
        }

        return undefined;
    }

    hasRelationWithPropertyPath(propertyPath: string): boolean {
        return this.relations.some((relation) => relation.propertyPath === propertyPath);
    }

    hasEmbeddedWithPropertyPath(propertyPath: string): boolean {
        return this.allEmbeddeds.some((embedded) => embedded.propertyPath === propertyPath);
    }

    getEntityIdMap(entity: ObjectIndexType | undefined): ObjectIndexType | undefined {
        if (!entity) {
            return undefined;
        }

        return CQDataStorage.getValueMap(entity, this.primaryColumns, {
            skipNulls: true,
        });
    }

    getEntityIdMixedMap(entity: ObjectIndexType | undefined): ObjectIndexType | undefined {
        if (!entity) {
            return entity;
        }

        const idMap = this.getEntityIdMap(entity);

        if (this.hasMultiplePrimaryKeys) {
            return idMap;
        } else if (idMap) {
            return this.primaryColumns[0].getEntityValue(idMap);
        }

        return idMap;
    }

    ensureEntityIdMap(id: any): ObjectIndexType {
        if (ObjectUtil.isObject(id)) {
            return id;
        }

        if (this.hasMultiplePrimaryKeys) throw new CannotCreateEntityIdMapError(this, id);

        return this.primaryColumns[0].createValueMap(id);
    }

    static getValueMap(
        entity: ObjectIndexType,
        columns: ColumnDataStorage[],
        options?: { skipNulls?: boolean },
    ): ObjectIndexType | undefined {
        return columns.reduce(
            (map, column) => {
                const value = column.getEntityValueMap(entity, options);

                if (map === undefined || value === null || value === undefined) {
                    return undefined;
                }

                return CQUtil.mergeDeep(map, value);
            },
            {} as ObjectIndexType | undefined,
        );
    }
}
