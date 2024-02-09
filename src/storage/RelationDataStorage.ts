/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { DeferrableType } from '../types/DeferrableType';
import { ObjectIndexType } from '../types/ObjectIndexType';
import { CQDataStorage } from './CQDataStorage';
import { EmbeddedDataStorage } from './EmbeddedDataStorage';
import { ForeignKeyDataStorage } from './ForeignKeyDataStorage';
import { ColumnDataStorage } from './column/ColumnDataStorage';
import { OnDeleteType } from './types/OnDeleteType';
import { OnUpdateType } from './types/OnUpdateType';
import { RelationType } from './types/RelationType';

/**
 * `RelationDataStorage.ts`
 *
 * Entity의 모든 관계를 담고 있는 정보를 포함하고 있는 class이다.
 */
export class RelationDataStorage {
    readonly '_instance' = Symbol.for('RelationDataStorage');

    dataStorage: CQDataStorage;

    embeddedDataStorage?: EmbeddedDataStorage;

    inverseEntityMetadata: CQDataStorage;

    inverseDataStorage: CQDataStorage;

    junctionDataStorage?: CQDataStorage;

    relationType: RelationType;

    target: Function | string;

    type: Function | string;

    propertyName: string;

    propertyPath: string;

    deferrable?: DeferrableType;

    isPrimary: boolean = false;

    isLazy: boolean = false;

    isEager: boolean = false;

    persistenceEnabled: boolean = true;

    orphanedRowAction?: 'nullify' | 'delete' | 'soft-delete' | 'disable';

    isCascadeInsert: boolean = false;

    isCascadeUpdate: boolean = false;

    isCascadeRemove: boolean = false;

    isCascadeSoftRemove: boolean = false;

    isCascadeRecover: boolean = false;

    isNullable: boolean = true;

    onDelete?: OnDeleteType;

    onUpdate?: OnUpdateType;

    createForeignKeyConstraints: boolean = true;

    isOwning: boolean = false;

    isOneToMany: boolean = false;

    isOneToOneOwner: boolean = false;

    isManyToOne: boolean = false;

    isManyToMany: boolean = false;

    isManyToManyOwner: boolean = false;

    inverseSidePropertyPath: string;

    inverseRelation?: RelationDataStorage;

    joinTableName: string;

    foreignKeys: ForeignKeyDataStorage[] = [];

    joinColumns: ColumnDataStorage[] = [];

    isWithJoinColumn: boolean = false;

    inverseJoinColumns: ColumnDataStorage[] = [];

    getEntityValue(
        entity: ObjectIndexType,
        getLazyRelationsPromiseValue: boolean = false,
    ): any | undefined {
        if (entity === null || entity === undefined) {
            return undefined;
        }

        if (this.embeddedDataStorage) {
            const propertyNames = [...this.embeddedDataStorage.parentPropertyNames];

            const extractEmbeddedColumnValue = (
                propertyNames: string[],
                value: ObjectIndexType,
            ): any => {
                const propertyName = propertyNames.shift();

                if (propertyName) {
                    if (value[propertyName]) {
                        return extractEmbeddedColumnValue(propertyNames, value[propertyName]);
                    }
                    return undefined;
                }

                return value;
            };

            const embeddedObject = extractEmbeddedColumnValue(propertyNames, entity);

            if (this.isLazy) {
                if (embeddedObject['__' + this.propertyName + '__'] !== undefined)
                    return embeddedObject['__' + this.propertyName + '__'];

                if (getLazyRelationsPromiseValue === true) return embeddedObject[this.propertyName];

                return undefined;
            }
            return embeddedObject
                ? embeddedObject[this.isLazy ? '__' + this.propertyName + '__' : this.propertyName]
                : undefined;
        } else {
            if (this.isLazy) {
                if (entity['__' + this.propertyName + '__'] !== undefined)
                    return entity['__' + this.propertyName + '__'];

                if (getLazyRelationsPromiseValue === true) return entity[this.propertyName];

                return undefined;
            }
            return entity[this.propertyName];
        }
    }
}
