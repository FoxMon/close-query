/* eslint-disable @typescript-eslint/ban-types */
import { DeferrableType } from '../types/DeferrableType';
import { CQDataStorage } from './CQDataStorage';
import { ForeignKeyDataStorage } from './ForeignKeyDataStorage';
import { ColumnDataStorage } from './column/ColumnDataStorage';
import { OnDeleteType } from './types/OnDeleteType';
import { OnUpdateType } from './types/OnUpdateType';

/**
 * `RelationDataStorage.ts`
 *
 * Entity의 모든 관계를 담고 있는 정보를 포함하고 있는 class이다.
 */
export class RelationDataStorage {
    readonly '_instance' = Symbol.for('RelationDataStorage');

    dataStorage: CQDataStorage;

    inverseDataStorage: CQDataStorage;

    junctionDataStorage?: CQDataStorage;

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

    inverseJoinColumns: ColumnDataStorage[] = [];
}
