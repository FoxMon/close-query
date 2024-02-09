/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { CQError } from '../error/CQError';
import { Manager } from '../manager/Manager';
import { CQDataStorage } from './CQDataStorage';
import { DataStorageListener } from './DataStorageListener';
import { EmbeddedDataStorageOption } from './EmbeddedDataStorageOption';
import { RelationCountDataStorage } from './RelationCountDataStorage';
import { RelationDataStorage } from './RelationDataStorage';
import { RelationIdDataStorage } from './RelationIdDataStorage';
import { ColumnDataStorage } from './column/ColumnDataStorage';
import { IndexDataStorage } from './index/IndexDataStorage';
import { UniqueDataStorage } from './unique/UniqueDataStorage';

/**
 * `EmbeddedDataStorage.ts`
 */
export class EmbeddedDataStorage {
    dataStorage: CQDataStorage;

    parentEmbeddedDataStorage?: EmbeddedDataStorage;

    type: Function | string;

    propertyName: string;

    propertyPath: string;

    columns: ColumnDataStorage[] = [];

    relations: RelationDataStorage[] = [];

    listeners: DataStorageListener[] = [];

    indexes: IndexDataStorage[] = [];

    uniques: UniqueDataStorage[] = [];

    relationIds: RelationIdDataStorage[] = [];

    relationCounts: RelationCountDataStorage[] = [];

    embeddeds: EmbeddedDataStorage[] = [];

    isAlwaysUsingConstructor: boolean = true;

    isArray: boolean = false;

    customPrefix: string | boolean | undefined;

    prefix: string;

    parentPropertyNames: string[] = [];

    parentPrefixes: string[] = [];

    embeddedMetadataTree: EmbeddedDataStorage[] = [];

    columnsFromTree: ColumnDataStorage[] = [];

    relationsFromTree: RelationDataStorage[] = [];

    listenersFromTree: DataStorageListener[] = [];

    indicesFromTree: IndexDataStorage[] = [];

    uniquesFromTree: UniqueDataStorage[] = [];

    relationIdsFromTree: RelationIdDataStorage[] = [];

    relationCountsFromTree: RelationCountDataStorage[] = [];

    constructor(options: { dataStorage: CQDataStorage; args: EmbeddedDataStorageOption }) {
        this.dataStorage = options.dataStorage;
        this.type = options.args.type();
        this.propertyName = options.args.propertyName;
        this.customPrefix = options.args.prefix;
        this.isArray = options.args.isArray;
    }

    create(options?: { fromDeserializer?: boolean }): any {
        if (!(typeof this.type === 'function')) {
            return {};
        }

        if (options?.fromDeserializer || !this.isAlwaysUsingConstructor) {
            return Object.create(this.type.prototype);
        } else {
            return new (this.type as any)();
        }
    }

    build(manager: Manager): this {
        this.embeddeds.forEach((embedded) => embedded.build(manager));
        this.prefix = this.buildPrefix(manager);
        this.parentPropertyNames = this.buildParentPropertyNames();
        this.parentPrefixes = this.buildParentPrefixes();
        this.propertyPath = this.parentPropertyNames.join('.');
        this.embeddedMetadataTree = this.buildEmbeddedMetadataTree();
        this.columnsFromTree = this.buildColumnsFromTree();
        this.relationsFromTree = this.buildRelationsFromTree();
        this.listenersFromTree = this.buildListenersFromTree();
        this.indicesFromTree = this.buildIndicesFromTree();
        this.uniquesFromTree = this.buildUniquesFromTree();
        this.relationIdsFromTree = this.buildRelationIdsFromTree();
        this.relationCountsFromTree = this.buildRelationCountsFromTree();

        if (manager.options.entitySkipConstructor) {
            this.isAlwaysUsingConstructor = !manager.options.entitySkipConstructor;
        }

        return this;
    }

    protected buildPartialPrefix(): string[] {
        if (this.customPrefix === undefined || this.customPrefix === true) {
            return [this.propertyName];
        }

        if (this.customPrefix === '' || this.customPrefix === false) {
            return [];
        }

        if (typeof this.customPrefix === 'string') {
            return [this.customPrefix];
        }

        throw new CQError(
            `Invalid prefix option given for ${this.dataStorage.targetName}#${this.propertyName}`,
        );
    }

    protected buildPrefix(manager: Manager): string {
        const prefixes: string[] = [];

        if (this.parentEmbeddedDataStorage) {
            prefixes.push(this.parentEmbeddedDataStorage.buildPrefix(manager));
        }

        prefixes.push(...this.buildPartialPrefix());

        return prefixes.join('_');
    }

    protected buildParentPropertyNames(): string[] {
        return this.parentEmbeddedDataStorage
            ? this.parentEmbeddedDataStorage.buildParentPropertyNames().concat(this.propertyName)
            : [this.propertyName];
    }

    protected buildParentPrefixes(): string[] {
        return this.parentEmbeddedDataStorage
            ? this.parentEmbeddedDataStorage.buildParentPrefixes().concat(this.buildPartialPrefix())
            : this.buildPartialPrefix();
    }

    protected buildEmbeddedMetadataTree(): EmbeddedDataStorage[] {
        return this.parentEmbeddedDataStorage
            ? this.parentEmbeddedDataStorage.buildEmbeddedMetadataTree().concat(this)
            : [this];
    }

    protected buildColumnsFromTree(): ColumnDataStorage[] {
        return this.embeddeds.reduce(
            (columns, embedded) => columns.concat(embedded.buildColumnsFromTree()),
            this.columns,
        );
    }

    protected buildRelationsFromTree(): RelationDataStorage[] {
        return this.embeddeds.reduce(
            (relations, embedded) => relations.concat(embedded.buildRelationsFromTree()),
            this.relations,
        );
    }

    protected buildListenersFromTree(): DataStorageListener[] {
        return this.embeddeds.reduce(
            (relations, embedded) => relations.concat(embedded.buildListenersFromTree()),
            this.listeners,
        );
    }

    protected buildIndicesFromTree(): IndexDataStorage[] {
        return this.embeddeds.reduce(
            (relations, embedded) => relations.concat(embedded.buildIndicesFromTree()),
            this.indexes,
        );
    }

    protected buildUniquesFromTree(): UniqueDataStorage[] {
        return this.embeddeds.reduce(
            (relations, embedded) => relations.concat(embedded.buildUniquesFromTree()),
            this.uniques,
        );
    }

    protected buildRelationIdsFromTree(): RelationIdDataStorage[] {
        return this.embeddeds.reduce(
            (relations, embedded) => relations.concat(embedded.buildRelationIdsFromTree()),
            this.relationIds,
        );
    }

    protected buildRelationCountsFromTree(): RelationCountDataStorage[] {
        return this.embeddeds.reduce(
            (relations, embedded) => relations.concat(embedded.buildRelationCountsFromTree()),
            this.relationCounts,
        );
    }
}
