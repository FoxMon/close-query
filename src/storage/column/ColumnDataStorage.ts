/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { ObjectIndexType } from '../../types/ObjectIndexType';
import { ValueTransformer } from '../../types/ValueTransformer';
import { ColumnType } from '../../types/column/ColumType';
import { CQUtil } from '../../utils/CQUtil';
import { CheckerUtil } from '../../utils/CheckerUtil';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { CQDataStorage } from '../CQDataStorage';
import { EmbeddedDataStorage } from '../EmbeddedDataStorage';
import { RelationDataStorage } from '../RelationDataStorage';

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

    databasePath: string;

    databaseName: string;

    type: ColumnType;

    transformer?: ValueTransformer | ValueTransformer[];

    length: string = '';

    width?: number;

    collation?: string;

    isPrimary: boolean = false;

    isNullable: boolean = false;

    isDiscriminator: boolean = false;

    isCreateDate: boolean = false;

    isUpdateDate: boolean = false;

    isDeleteDate: boolean = false;

    isVirtual: boolean = false;

    generationStrategy?: 'uuid' | 'increment' | 'rowid';

    referencedColumn: ColumnDataStorage | undefined;

    primaryKeyConstraintName?: string;

    foreignKeyConstraintName?: string;

    query?: (alias: string) => string;

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
}
