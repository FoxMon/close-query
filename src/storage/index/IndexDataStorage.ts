/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { CQError } from '../../error/CQError';
import { Naming } from '../../naming/Naming';
import { CQDataStorage } from '../CQDataStorage';
import { EmbeddedDataStorage } from '../EmbeddedDataStorage';
import { ColumnDataStorage } from '../column/ColumnDataStorage';
import { IndexDataStorageOption } from './IndexDataStorageOption';

/**
 * `IndexDataStorage.ts`
 *
 * Index에 관련된 Data를 다루는 Class 정의
 */
export class IndexDataStorage {
    dataStorage: CQDataStorage;

    embeddedDataStorage?: EmbeddedDataStorage;

    unique: boolean = false;

    isSpatial: boolean = false;

    isFulltext: boolean = false;

    isNullFiltered: boolean = false;

    parser?: string;

    synchronize: boolean = true;

    isSparse?: boolean;

    isBackground?: boolean;

    isConcurrent?: boolean;

    expireAfterSeconds?: number;

    target?: Function | string;

    columns: ColumnDataStorage[] = [];

    givenName?: string;

    givenColumnNames?: ((object?: any) => any[] | { [key: string]: number }) | string[];

    name: string;

    where?: string;

    columnNamesWithOrderingMap: { [key: string]: number } = {};

    constructor(options: {
        dataStorage: CQDataStorage;
        embeddedDataStorage?: EmbeddedDataStorage;
        columns?: ColumnDataStorage[];
        args?: IndexDataStorageOption;
    }) {
        this.dataStorage = options.dataStorage;
        this.embeddedDataStorage = options.embeddedDataStorage;

        if (options.columns) {
            this.columns = options.columns;
        }

        if (options.args) {
            this.target = options.args.target;

            if (options.args.synchronize !== null && options.args.synchronize !== undefined) {
                this.synchronize = options.args.synchronize;
            }

            this.unique = !!options.args.unique;
            this.isSpatial = !!options.args.spatial;
            this.isFulltext = !!options.args.fulltext;
            this.isNullFiltered = !!options.args.nullFiltered;
            this.parser = options.args.parser;
            this.where = options.args.where;
            this.isSparse = options.args.sparse;
            this.isBackground = options.args.background;
            this.isConcurrent = options.args.concurrent;
            this.expireAfterSeconds = options.args.expireAfterSeconds;
            this.givenName = options.args.name;
            this.givenColumnNames = options.args.columns;
        }
    }

    create(naming: Naming): this {
        if (this.synchronize === false) {
            this.name = this.givenName!;
            return this;
        }

        const map: { [key: string]: number } = {};

        if (this.givenColumnNames) {
            let columnPropertyPaths: string[] = [];
            if (Array.isArray(this.givenColumnNames)) {
                columnPropertyPaths = this.givenColumnNames.map((columnName) => {
                    if (this.embeddedDataStorage) {
                        return this.embeddedDataStorage.propertyPath + '.' + columnName;
                    }
                    return columnName.trim();
                });

                columnPropertyPaths.forEach((propertyPath) => (map[propertyPath] = 1));
            } else {
                const columnsFnResult = this.givenColumnNames(this.dataStorage.propertiesMap);

                if (Array.isArray(columnsFnResult)) {
                    columnPropertyPaths = columnsFnResult.map((i: any) => String(i));

                    columnPropertyPaths.forEach((name) => (map[name] = 1));
                } else {
                    columnPropertyPaths = Object.keys(columnsFnResult).map((i: any) => String(i));

                    Object.keys(columnsFnResult).forEach(
                        (columnName) => (map[columnName] = columnsFnResult[columnName]),
                    );
                }
            }

            this.columns = columnPropertyPaths
                .map((propertyPath) => {
                    const columnWithSameName = this.dataStorage.columns.find(
                        (column) => column.propertyPath === propertyPath,
                    );

                    if (columnWithSameName) {
                        return [columnWithSameName];
                    }

                    const relationWithSameName = this.dataStorage.relations.find(
                        (relation) =>
                            relation.isWithJoinColumn && relation.propertyName === propertyPath,
                    );

                    if (relationWithSameName) {
                        return relationWithSameName.joinColumns;
                    }

                    const indexName = this.givenName ? '"' + this.givenName + '" ' : '';
                    const entityName = this.dataStorage.targetName;

                    throw new CQError(
                        `Index ${indexName}contains column that is missing in the entity (${entityName}): ` +
                            propertyPath,
                    );
                })
                .reduce((a, b) => a.concat(b));
        }

        this.columnNamesWithOrderingMap = Object.keys(map).reduce(
            (updatedMap, key) => {
                const column = this.dataStorage.columns.find(
                    (column) => column.propertyPath === key,
                );
                if (column) updatedMap[column.databasePath] = map[key];

                return updatedMap;
            },
            {} as { [key: string]: number },
        );

        this.name = this.givenName
            ? this.givenName
            : naming.indexName(
                  this.dataStorage.tableName,
                  this.columns.map((column) => column.databaseName),
                  this.where,
              );
        return this;
    }
}
