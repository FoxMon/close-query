/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { CannotCreateEntityIdMapError } from '../error/CannotCreateEntityidMapError';
import { Manager } from '../manager/Manager';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { CQUtil } from '../utils/CQUtil';
import { ObjectUtil } from '../utils/ObjectUtil';
import { EmbeddedDataStorage } from './EmbeddedDataStorage';
import { RelationDataStorage } from './RelationDataStorage';
import { ColumnDataStorage } from './column/ColumnDataStorage';
import { TableDataStorage } from './table/TableDataStorage';

/**
 * `CQDataStorage.ts`
 *
 * CQ의 모든 MetaData를 관리하는 Class를 정의하도록 한다.
 */
export class CQDataStorage {
    readonly '_instance' = Symbol.for('CQDataStorage');

    manager: Manager;

    tables: TableDataStorage;

    name: string;

    schema?: string;

    target: Function | string;

    targetName: string;

    database?: string;

    tableName: string;

    tablePath: string;

    embeddeds: EmbeddedDataStorage[] = [];

    allEmbeddeds: EmbeddedDataStorage[] = [];

    synchronize: boolean = true;

    columns: ColumnDataStorage[] = [];

    primaryColumns: ColumnDataStorage[] = [];

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

    relations: RelationDataStorage[] = [];

    parentCQDataStorage: CQDataStorage;

    discriminatorValue: string;

    hasMultiplePrimaryKeys: boolean = false;

    childCQDataStorages: CQDataStorage[] = [];

    discriminatorColumn?: ColumnDataStorage;

    expression?: string | ((manager: Manager) => SelectQueryBuilder<any>);

    propertiesMap: ObjectIndexType;

    isJunction: boolean = false;

    constructor(options: { manager: Manager; args: TableDataStorage }) {
        this.manager = options.manager;
        this.tables = options.args;
        this.expression = this.tables.expression;
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
