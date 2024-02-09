/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { CQError } from '../../error/CQError';
import { Naming } from '../../naming/Naming';
import { DeferrableType } from '../../types/DeferrableType';
import { CQDataStorage } from '../CQDataStorage';
import { EmbeddedDataStorage } from '../EmbeddedDataStorage';
import { UniqueOption } from '../UniqueDataStorageOption';
import { ColumnDataStorage } from '../column/ColumnDataStorage';

/**
 * `UniqueDataStorage.ts`
 *
 * Unique 제약조건에 대한 정보를 다루는 Class를 정의한다.
 */
export class UniqueDataStorage {
    dataStorage: CQDataStorage;

    embeddedDataStorage?: EmbeddedDataStorage;

    target?: Function | string;

    columns: ColumnDataStorage[] = [];

    deferrable?: DeferrableType;

    givenName?: string;

    givenColumnNames?: ((object?: any) => any[] | { [key: string]: number }) | string[];

    name: string;

    columnNamesWithOrderingMap: { [key: string]: number } = {};

    constructor(options: {
        dataStorage: CQDataStorage;
        embeddedDataStorage?: EmbeddedDataStorage;
        columns?: ColumnDataStorage[];
        args?: UniqueOption;
    }) {
        this.dataStorage = options.dataStorage;
        this.embeddedDataStorage = options.embeddedDataStorage;

        if (options.columns) {
            this.columns = options.columns;
        }

        if (options.args) {
            this.target = options.args.target;
            this.givenName = options.args.name;
            this.givenColumnNames = options.args.columns;
            this.deferrable = options.args.deferrable;
        }
    }

    create(naming: Naming): this {
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
                .map((propertyName) => {
                    const columnWithSameName = this.dataStorage.columns.find(
                        (column) => column.propertyPath === propertyName,
                    );

                    if (columnWithSameName) {
                        return [columnWithSameName];
                    }

                    const relationWithSameName = this.dataStorage.relations.find(
                        (relation) =>
                            relation.isWithJoinColumn && relation.propertyName === propertyName,
                    );

                    if (relationWithSameName) {
                        return relationWithSameName.joinColumns;
                    }

                    const indexName = this.givenName ? '"' + this.givenName + '" ' : '';
                    const entityName = this.dataStorage.targetName;

                    throw new CQError(
                        `Unique constraint ${indexName}contains column that is missing in the entity (${entityName}): ` +
                            propertyName,
                    );
                })
                .reduce((a, b) => a.concat(b));
        }

        this.columnNamesWithOrderingMap = Object.keys(map).reduce(
            (updatedMap, key) => {
                const column = this.dataStorage.columns.find(
                    (column) => column.propertyPath === key,
                );

                if (column) {
                    updatedMap[column.databasePath] = map[key];
                }

                return updatedMap;
            },
            {} as { [key: string]: number },
        );

        this.name = this.givenName
            ? this.givenName
            : naming.uniqueConstraintName(
                  this.dataStorage.tableName,
                  this.columns.map((column) => column.databaseName),
              );
        return this;
    }
}
