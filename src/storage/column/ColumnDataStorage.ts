/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { VirtualColumnOptions } from '../../decorators/option/VirtualColumnOptions';
import { Manager } from '../../manager/Manager';
import { ObjectIndexType } from '../../types/ObjectIndexType';
import { ValueTransformer } from '../../types/ValueTransformer';
import { ColumnType } from '../../types/column/ColumType';
import { CQUtil } from '../../utils/CQUtil';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { CQDataStorage } from '../CQDataStorage';
import { EmbeddedDataStorage } from '../EmbeddedDataStorage';
import { RelationDataStorage } from '../RelationDataStorage';
import { ColumnDataStorageOption } from './ColumnDataStorageOption';

/**
 * `ColumnDataStorage.ts`
 *
 * Column에 대한 DataStorage를 관리하는 Class를 정의한다.
 */
export class ColumnDataStorage {
    readonly '_instance' = Symbol.for('ColumnDataStorage');

    dataStorage: CQDataStorage;

    target: Function | string;

    embeddedDataStorage?: EmbeddedDataStorage;

    relationDataStorage?: RelationDataStorage;

    propertyPath: string;

    propertyName: string;

    propertyAliasName: string;

    databasePath: string;

    databaseName: string;

    databaseNameWithoutPrefixes: string;

    givenDatabaseName?: string;

    type: ColumnType;

    transformer?: ValueTransformer | ValueTransformer[];

    length: string = '';

    width?: number;

    collation?: string;

    isArray: boolean = false;

    isPrimary: boolean = false;

    isGenerated: boolean = false;

    isNullable: boolean = false;

    isSelect: boolean = true;

    isInsert: boolean = true;

    isUpdate: boolean = true;

    isDiscriminator: boolean = false;

    isCreateDate: boolean = false;

    isUpdateDate: boolean = false;

    isDeleteDate: boolean = false;

    isVersion: boolean = false;

    isObjectId: boolean = false;

    isVirtual: boolean = false;

    isTreeLevel: boolean = false;

    isVirtualProperty: boolean = false;

    isNestedSetLeft: boolean = false;

    isNestedSetRight: boolean = false;

    isMaterializedPath: boolean = false;

    unsigned?: boolean = false;

    generationStrategy?: 'uuid' | 'increment' | 'rowid';

    generatedIdentity?: 'ALWAYS' | 'BY DEFAULT';

    generatedType?: 'VIRTUAL' | 'STORED';

    hstoreType?: 'object' | 'string';

    closureType?: 'ancestor' | 'descendant';

    referencedColumn: ColumnDataStorage | undefined;

    primaryKeyConstraintName?: string;

    foreignKeyConstraintName?: string;

    spatialFeatureType?: string;

    onUpdate?: string;

    precision?: number | null;

    scale?: number;

    zerofill: boolean = false;

    enum?: (string | number)[];

    enumName?: string;

    asExpression?: string;

    comment?: string;

    charset?: string;

    default?:
        | number
        | boolean
        | string
        | null
        | (number | boolean | string)[]
        | Record<string, object>
        | (() => string);

    srid: number;

    query?: (alias: string) => string;

    constructor(options: {
        manager: Manager;
        dataStorage: CQDataStorage;
        embeddedDataStorage?: EmbeddedDataStorage;
        referencedColumn?: ColumnDataStorage;
        closureType?: 'ancestor' | 'descendant';
        nestedSetLeft?: boolean;
        nestedSetRight?: boolean;
        materializedPath?: boolean;
        args: ColumnDataStorageOption;
    }) {
        this.dataStorage = options.dataStorage;
        this.embeddedDataStorage = options.embeddedDataStorage!;
        this.referencedColumn = options.referencedColumn;

        if (options.args.target) this.target = options.args.target;
        if (options.args.propertyName) this.propertyName = options.args.propertyName;
        if (options.args.options.name) this.givenDatabaseName = options.args.options.name;
        if (options.args.options.type) this.type = options.args.options.type;
        if (options.args.options.length)
            this.length = options.args.options.length ? options.args.options.length.toString() : '';
        if (options.args.options.width) this.width = options.args.options.width;
        if (options.args.options.charset) this.charset = options.args.options.charset;
        if (options.args.options.collation) this.collation = options.args.options.collation;
        if (options.args.options.primary) this.isPrimary = options.args.options.primary;
        if (options.args.options.default === null) this.isNullable = true;
        if (options.args.options.nullable !== undefined)
            this.isNullable = options.args.options.nullable;
        if (options.args.options.select !== undefined) this.isSelect = options.args.options.select;
        if (options.args.options.insert !== undefined) this.isInsert = options.args.options.insert;
        if (options.args.options.update !== undefined) this.isUpdate = options.args.options.update;

        if (options.args.options.comment) this.comment = options.args.options.comment;
        if (options.args.options.default !== undefined) this.default = options.args.options.default;
        if (options.args.options.onUpdate) this.onUpdate = options.args.options.onUpdate;
        if (options.args.options.generatedIdentity)
            this.generatedIdentity = options.args.options.generatedIdentity;
        if (options.args.options.scale !== null && options.args.options.scale !== undefined)
            this.scale = options.args.options.scale;
        if (options.args.options.zerofill) {
            this.zerofill = options.args.options.zerofill;
            this.unsigned = true;
        }
        if (options.args.options.unsigned) this.unsigned = options.args.options.unsigned;
        if (options.args.options.precision !== null)
            this.precision = options.args.options.precision;
        if (options.args.options.enum) {
            if (
                ObjectUtil.isObject(options.args.options.enum) &&
                !Array.isArray(options.args.options.enum)
            ) {
                this.enum = Object.keys(options.args.options.enum)
                    .filter(
                        (key) =>
                            isNaN(+key) &&
                            typeof (options.args.options.enum as ObjectIndexType)[key] !==
                                'function',
                    )
                    .map((key) => (options.args.options.enum as ObjectIndexType)[key]);
            } else {
                this.enum = options.args.options.enum;
            }
        }
        if (options.args.options.enumName) {
            this.enumName = options.args.options.enumName;
        }
        if (options.args.options.primaryKeyName) {
            this.primaryKeyConstraintName = options.args.options.primaryKeyName;
        }
        if (options.args.options.foreignKeyName) {
            this.foreignKeyConstraintName = options.args.options.foreignKeyName;
        }
        if (options.args.options.asExpression) {
            this.asExpression = options.args.options.asExpression;
            this.generatedType = options.args.options.generatedType
                ? options.args.options.generatedType
                : 'VIRTUAL';
        }
        if (options.args.options.hstoreType) this.hstoreType = options.args.options.hstoreType;
        if (options.args.options.array) this.isArray = options.args.options.array;
        if (options.args.mode) {
            this.isVirtualProperty = options.args.mode === 'virtual-property';
            this.isVirtual = options.args.mode === 'virtual';
            this.isTreeLevel = options.args.mode === 'treeLevel';
            this.isCreateDate = options.args.mode === 'createDate';
            this.isUpdateDate = options.args.mode === 'updateDate';
            this.isDeleteDate = options.args.mode === 'deleteDate';
            this.isVersion = options.args.mode === 'version';
            this.isObjectId = options.args.mode === 'objectId';
        }
        if (this.isVirtualProperty) {
            this.isInsert = false;
            this.isUpdate = false;
        }
        if (options.args.options.transformer) this.transformer = options.args.options.transformer;
        if (options.args.options.spatialFeatureType)
            this.spatialFeatureType = options.args.options.spatialFeatureType;
        if (options.args.options.srid !== undefined) this.srid = options.args.options.srid;
        if ((options.args.options as VirtualColumnOptions).query)
            this.query = (options.args.options as VirtualColumnOptions).query;
        if (this.isTreeLevel) this.type = options.manager.connector.mappedDataTypes.treeLevel;
        if (this.isCreateDate) {
            if (!this.type) this.type = options.manager.connector.mappedDataTypes.createDate;
            if (!this.default)
                this.default = () => options.manager.connector.mappedDataTypes.createDateDefault;
            if (
                this.precision === undefined &&
                options.args.options.precision === undefined &&
                options.manager.connector.mappedDataTypes.createDatePrecision
            )
                this.precision = options.manager.connector.mappedDataTypes.createDatePrecision;
        }
        if (this.isUpdateDate) {
            if (!this.type) this.type = options.manager.connector.mappedDataTypes.updateDate;
            if (!this.default)
                this.default = () => options.manager.connector.mappedDataTypes.updateDateDefault;
            if (!this.onUpdate)
                this.onUpdate = options.manager.connector.mappedDataTypes.updateDateDefault;
            if (
                this.precision === undefined &&
                options.args.options.precision === undefined &&
                options.manager.connector.mappedDataTypes.updateDatePrecision
            )
                this.precision = options.manager.connector.mappedDataTypes.updateDatePrecision;
        }
        if (this.isDeleteDate) {
            if (!this.type) this.type = options.manager.connector.mappedDataTypes.deleteDate;
            if (!this.isNullable)
                this.isNullable = options.manager.connector.mappedDataTypes.deleteDateNullable;
            if (
                this.precision === undefined &&
                options.args.options.precision === undefined &&
                options.manager.connector.mappedDataTypes.deleteDatePrecision
            )
                this.precision = options.manager.connector.mappedDataTypes.deleteDatePrecision;
        }
        if (this.isVersion) this.type = options.manager.connector.mappedDataTypes.version;
        if (options.closureType) this.closureType = options.closureType;
        if (options.nestedSetLeft) this.isNestedSetLeft = options.nestedSetLeft;
        if (options.nestedSetRight) this.isNestedSetRight = options.nestedSetRight;
        if (options.materializedPath) this.isMaterializedPath = options.materializedPath;
    }

    setEntityValue(entity: ObjectIndexType, value: any): void {
        if (this.embeddedDataStorage) {
            const extractEmbeddedColumnValue = (
                embeddedDataStorage: EmbeddedDataStorage[],
                map: ObjectIndexType,
            ): any => {
                const embeddedMetadata = embeddedDataStorage.shift();

                if (embeddedMetadata) {
                    if (!map[embeddedMetadata.propertyName]) {
                        map[embeddedMetadata.propertyName] = embeddedMetadata.create();
                    }

                    extractEmbeddedColumnValue(
                        embeddedDataStorage,
                        map[embeddedMetadata.propertyName],
                    );
                    return map;
                }

                map[this.propertyName] = value;

                return map;
            };
            return extractEmbeddedColumnValue(
                [...this.embeddedDataStorage.embeddedMetadataTree],
                entity,
            );
        } else {
            if (
                !this.dataStorage.isJunction &&
                this.isVirtual &&
                this.referencedColumn &&
                this.referencedColumn.propertyName !== this.propertyName
            ) {
                if (!(this.propertyName in entity)) {
                    entity[this.propertyName] = {};
                }

                entity[this.propertyName][this.referencedColumn.propertyName] = value;
            } else {
                entity[this.propertyName] = value;
            }
        }
    }

    createValueMap(value: any, useDatabaseName = false) {
        if (this.embeddedDataStorage) {
            const propertyNames = [...this.embeddedDataStorage.parentPropertyNames];

            const extractEmbeddedColumnValue = (
                propertyNames: string[],
                map: ObjectIndexType,
            ): any => {
                const propertyName = propertyNames.shift();
                if (propertyName) {
                    map[propertyName] = {};
                    extractEmbeddedColumnValue(propertyNames, map[propertyName]);
                    return map;
                }

                if (
                    (this.generationStrategy === 'increment' ||
                        this.generationStrategy === 'rowid') &&
                    this.type === 'bigint' &&
                    value !== null
                ) {
                    value = String(value);
                }

                map[useDatabaseName ? this.databaseName : this.propertyName] = value;

                return map;
            };
            return extractEmbeddedColumnValue(propertyNames, {});
        } else {
            if (
                (this.generationStrategy === 'increment' || this.generationStrategy === 'rowid') &&
                this.type === 'bigint' &&
                value !== null
            )
                value = String(value);

            return {
                [useDatabaseName ? this.databaseName : this.propertyName]: value,
            };
        }
    }

    getEntityValueMap(
        entity: ObjectIndexType,
        _options?: { skipNulls?: boolean },
    ): ObjectIndexType | undefined {
        const returnNulls = false;

        if (this.embeddedDataStorage) {
            const propertyNames = [...this.embeddedDataStorage.parentPropertyNames];
            const isEmbeddedArray = this.embeddedDataStorage.isArray;

            const extractEmbeddedColumnValue = (
                propertyNames: string[],
                value: ObjectIndexType,
            ): ObjectIndexType => {
                if (value === undefined) {
                    return {};
                }

                const propertyName = propertyNames.shift();

                if (propertyName) {
                    const submap = extractEmbeddedColumnValue(propertyNames, value[propertyName]);
                    if (Object.keys(submap).length > 0) {
                        return { [propertyName]: submap };
                    }
                    return {};
                }

                if (isEmbeddedArray && Array.isArray(value)) {
                    return value.map((v) => ({
                        [this.propertyName]: v[this.propertyName],
                    }));
                }

                if (
                    value[this.propertyName] !== undefined &&
                    (returnNulls === false || value[this.propertyName] !== null)
                ) {
                    return { [this.propertyName]: value[this.propertyName] };
                }

                return {};
            };

            const map = extractEmbeddedColumnValue(propertyNames, entity);

            return Object.keys(map).length > 0 ? map : undefined;
        } else {
            if (
                this.relationDataStorage &&
                !Object.getOwnPropertyDescriptor(entity, this.relationDataStorage.propertyName)
                    ?.get &&
                entity[this.relationDataStorage.propertyName] &&
                ObjectUtil.isObject(entity[this.relationDataStorage.propertyName])
            ) {
                const map = this.relationDataStorage.joinColumns.reduce((map, joinColumn) => {
                    const value = joinColumn.referencedColumn!.getEntityValueMap(
                        entity[this.relationDataStorage!.propertyName],
                    );

                    if (value === undefined) {
                        return map;
                    }

                    return CQUtil.mergeDeep(map, value);
                }, {});
                if (Object.keys(map).length > 0) {
                    return { [this.propertyName]: map };
                }

                return undefined;
            } else {
                if (
                    entity[this.propertyName] !== undefined &&
                    (returnNulls === false || entity[this.propertyName] !== null)
                ) {
                    return { [this.propertyName]: entity[this.propertyName] };
                }

                return undefined;
            }
        }
    }

    getEntityValue(entity: ObjectIndexType, transform: boolean = false): any | undefined {
        if (entity === undefined || entity === null) {
            return undefined;
        }

        let value: any = undefined;

        if (this.embeddedDataStorage) {
            const propertyNames = [...this.embeddedDataStorage.parentPropertyNames];
            const isEmbeddedArray = this.embeddedDataStorage.isArray;

            const extractEmbeddedColumnValue = (
                propertyNames: string[],
                value: ObjectIndexType,
            ): any => {
                const propertyName = propertyNames.shift();
                return propertyName && value
                    ? extractEmbeddedColumnValue(propertyNames, value[propertyName])
                    : value;
            };

            const embeddedObject = extractEmbeddedColumnValue(propertyNames, entity);
            if (embeddedObject) {
                if (this.relationDataStorage && this.referencedColumn) {
                    const relatedEntity = this.relationDataStorage.getEntityValue(embeddedObject);

                    if (
                        relatedEntity &&
                        ObjectUtil.isObject(relatedEntity) &&
                        !CheckerUtil.checkIsFindOperator(relatedEntity) &&
                        !Buffer.isBuffer(relatedEntity)
                    ) {
                        value = this.referencedColumn.getEntityValue(relatedEntity);
                    } else if (
                        embeddedObject[this.propertyName] &&
                        ObjectUtil.isObject(embeddedObject[this.propertyName]) &&
                        !CheckerUtil.checkIsFindOperator(embeddedObject[this.propertyName]) &&
                        !Buffer.isBuffer(embeddedObject[this.propertyName]) &&
                        !(embeddedObject[this.propertyName] instanceof Date)
                    ) {
                        value = this.referencedColumn.getEntityValue(
                            embeddedObject[this.propertyName],
                        );
                    } else {
                        value = embeddedObject[this.propertyName];
                    }
                } else if (this.referencedColumn) {
                    value = this.referencedColumn.getEntityValue(embeddedObject[this.propertyName]);
                } else if (isEmbeddedArray && Array.isArray(embeddedObject)) {
                    value = embeddedObject.map((o) => o[this.propertyName]);
                } else {
                    value = embeddedObject[this.propertyName];
                }
            } else if (embeddedObject === null) {
                value = null;
            }
        } else {
            if (this.relationDataStorage && this.referencedColumn) {
                const relatedEntity = this.relationDataStorage.getEntityValue(entity);
                if (
                    relatedEntity &&
                    ObjectUtil.isObject(relatedEntity) &&
                    !CheckerUtil.checkIsFindOperator(relatedEntity) &&
                    !(typeof relatedEntity === 'function') &&
                    !Buffer.isBuffer(relatedEntity)
                ) {
                    value = this.referencedColumn.getEntityValue(relatedEntity);
                } else if (
                    entity[this.propertyName] &&
                    ObjectUtil.isObject(entity[this.propertyName]) &&
                    !CheckerUtil.checkIsFindOperator(entity[this.propertyName]) &&
                    !(typeof entity[this.propertyName] === 'function') &&
                    !Buffer.isBuffer(entity[this.propertyName]) &&
                    !(entity[this.propertyName] instanceof Date)
                ) {
                    value = this.referencedColumn.getEntityValue(entity[this.propertyName]);
                } else {
                    value = entity[this.propertyName];
                }
            } else if (this.referencedColumn) {
                value = this.referencedColumn.getEntityValue(entity[this.propertyName]);
            } else {
                value = entity[this.propertyName];
            }
        }

        if (transform && this.transformer) {
            value = ObjectUtil.transformTo(this.transformer, value);
        }

        return value;
    }

    compareEntityValue(entity: any, valueToCompareWith: any) {
        const columnValue = this.getEntityValue(entity);

        if (ObjectUtil.isObject(columnValue)) {
            return columnValue.equals(valueToCompareWith);
        }

        return columnValue === valueToCompareWith;
    }

    buildPropertyPath(): string {
        let path = '';

        if (this.embeddedDataStorage && this.embeddedDataStorage.parentPropertyNames.length) {
            path = this.embeddedDataStorage.parentPropertyNames.join('.') + '.';
        }

        path += this.propertyName;

        if (
            !this.dataStorage.isJunction &&
            this.isVirtual &&
            this.referencedColumn &&
            this.referencedColumn.propertyName !== this.propertyName
        ) {
            path += '.' + this.referencedColumn.propertyName;
        }

        return path;
    }

    buildDatabasePath(): string {
        let path = '';

        if (this.embeddedDataStorage && this.embeddedDataStorage.parentPropertyNames.length) {
            path = this.embeddedDataStorage.parentPropertyNames.join('.') + '.';
        }

        path += this.databaseName;

        if (
            !this.dataStorage.isJunction &&
            this.isVirtual &&
            this.referencedColumn &&
            this.referencedColumn.databaseName !== this.databaseName
        ) {
            path += '.' + this.referencedColumn.databaseName;
        }
        return path;
    }

    buildDatabaseName(dataStorage: Manager): string {
        const propertyNames = this.embeddedDataStorage
            ? this.embeddedDataStorage.parentPrefixes
            : [];

        return dataStorage.naming.columnName(
            this.propertyName,
            this.givenDatabaseName,
            propertyNames,
        );
    }

    create(manager: Manager): this {
        this.propertyPath = this.buildPropertyPath();
        this.propertyAliasName = this.propertyPath.replace('.', '_');
        this.databaseName = this.buildDatabaseName(manager);
        this.databasePath = this.buildDatabasePath();
        this.databaseNameWithoutPrefixes = manager.naming.columnName(
            this.propertyName,
            this.givenDatabaseName,
            [],
        );

        return this;
    }
}
