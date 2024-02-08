import { TableCloumnOption } from '../option/TableColumnOption';
import { TableIndexOption } from '../option/TableIndexOption';
import { TableOption } from '../option/TableOption';
import { TableCheck } from './TableCheck';
import { TableColumn } from './TableColumn';
import { TableExclusion } from './TableExclusion';
import { TableForeignKey } from './TableForeignKey';
import { TableIndex } from './TableIndex';
import { TableUnique } from './TableUnique';

/**
 * `Table.ts`
 *
 * Table에 관련된 로직들을 정의하도록 한다.
 * 외래키, 유니크, 인덱스 etc ...
 */
export class Table {
    readonly '_instance' = Symbol.for('Table');

    database?: string;

    schema?: string;

    name: string;

    columns: TableColumn[] = [];

    indexes: TableIndex[] = [];

    foreignKey: TableForeignKey[] = [];

    unique: TableUnique[] = [];

    checks: TableCheck[] = [];

    exclusions: TableExclusion[] = [];

    justCreated: boolean = false;

    withoutRowid?: boolean = false;

    engine?: string;

    comment?: string;

    constructor(options: TableOption) {
        if (options) {
            const { database, schema, name } = options;

            this.database = database;

            this.schema = schema;

            this.name = name;

            if (options.columns) {
                this.columns = options.columns.map(
                    (col: TableCloumnOption) => new TableColumn(col),
                );
            }

            if (options.indexes) {
                this.indexes = options.indexes.map(
                    (index: TableIndexOption) => new TableIndex(index),
                );
            }

            if (options.foreignKey) {
                this.foreignKey = options.foreignKey.map(
                    (foreign) =>
                        new TableForeignKey({
                            ...foreign,
                            referencedDatabase: foreign?.referencedDatabase || options.database,
                            referencedSchema: foreign?.referencedSchema || options.schema,
                        }),
                );
            }

            if (options.unique) {
                this.unique = options.unique.map((unq) => new TableUnique(unq));
            }

            if (options.checks) {
                this.checks = options.checks.map((check) => new TableCheck(check));
            }

            if (options.exclusions) {
                this.exclusions = options.exclusions.map((exc) => new TableExclusion(exc));
            }

            if (options.justCreated) {
                this.justCreated = options.justCreated;
            }

            if (options.withoutRowid) {
                this.withoutRowid = options.withoutRowid;
            }

            this.engine = options.engine;

            this.comment = options.comment;
        }
    }

    createTable(): Table {
        return new Table({
            database: this.database,
            schema: this.schema,
            name: this.name,
            columns: this.columns.map((col: TableColumn) => col.createTableColumn()),
            indexes: this.indexes.map((idx: TableIndex) => idx.createTableIndex()),
            foreignKey: this.foreignKey.map((fk) => fk.createTableForeignKey()),
            unique: this.unique.map((unq) => unq.createTableUnique()),
            checks: this.checks.map((check) => check.create()),
            exclusions: this.exclusions.map((exc) => exc.create()),
            justCreated: this.justCreated,
            withoutRowid: this.withoutRowid,
            engine: this.engine,
            comment: this.comment,
        });
    }

    getPrimaryColumn() {
        return this.columns.filter((col) => col.primary);
    }

    addTableColumn(column: TableColumn) {
        this.columns.push(column);
    }

    deleteTableColumn(column: TableColumn) {
        const foundColumn: TableColumn | undefined = this.columns.find(
            (col: TableColumn) => col.name === column.name,
        );

        if (foundColumn) {
            this.columns.splice(this.columns.indexOf(foundColumn), 1);
        }
    }

    addTableIndex(index: TableIndex) {
        this.indexes.push(index);

        if (index.columnNames.length === 1 && index.unique) {
            const column: TableColumn | undefined = this.columns.find(
                (col: TableColumn) => col.name === index.columnNames[0],
            );

            if (column) {
                column.unique = true;
            }
        }
    }

    deleteTableIndex(index: TableIndex) {
        const foundIndex: TableIndex | undefined = this.indexes.find(
            (idx: TableIndex) => idx.name === index.name,
        );

        if (foundIndex) {
            this.indexes.splice(this.indexes.indexOf(foundIndex), 1);

            if (foundIndex.columnNames.length === 1 && foundIndex.unique) {
                const foundColumn: TableColumn | undefined = this.columns.find(
                    (col: TableColumn) => (col.name = foundIndex.columnNames[0]),
                );

                if (foundColumn) {
                    foundColumn.unique = this.indexes.some(
                        (idx: TableIndex) =>
                            (idx.columnNames.length === 1 &&
                                idx.columnNames[0] === foundColumn.name &&
                                foundIndex.unique) ||
                            false,
                    );
                }
            }
        }
    }

    findColumnByName(name: string) {
        return this.columns.find((col) => col.name === name);
    }

    addForeignKey(foreign: TableForeignKey) {
        this.foreignKey.push(foreign);
    }

    deleteForeignKey(target: TableForeignKey) {
        const fk = this.foreignKey.find((elem) => elem.name === target.name);

        if (fk) {
            this.foreignKey.splice(this.foreignKey.indexOf(fk), 1);
        }
    }

    addUnique(unq: TableUnique) {
        this.unique.push(unq);

        if (unq.columnNames.length === 1) {
            const foundUniqueColumn = this.columns.find(
                (column) => column.name === unq.columnNames[0],
            );

            if (foundUniqueColumn) {
                foundUniqueColumn.unique = true;
            }
        }
    }

    deleteUnique(unq: TableUnique) {
        const foundUnique = this.unique.find((elem) => elem.name === unq.name);

        if (foundUnique) {
            this.unique.splice(this.unique.indexOf(foundUnique), 1);

            if (foundUnique.columnNames.length === 1) {
                const foundUniqueColumn = this.columns.find(
                    (column) => column.name === unq.columnNames[0],
                );
                if (foundUniqueColumn) {
                    foundUniqueColumn.unique = false;
                }
            }
        }
    }

    addCheck(check: TableCheck): void {
        this.checks.push(check);
    }

    removeCheck(removedCheck: TableCheck): void {
        const foundCheck = this.checks.find((check) => check.name === removedCheck.name);

        if (foundCheck) {
            this.checks.splice(this.checks.indexOf(foundCheck), 1);
        }
    }

    addExclusion(exclusion: TableExclusion): void {
        this.exclusions.push(exclusion);
    }

    removeExclusion(removedExclusion: TableExclusion): void {
        const foundExclusion = this.exclusions.find(
            (exclusion) => exclusion.name === removedExclusion.name,
        );

        if (foundExclusion) {
            this.exclusions.splice(this.exclusions.indexOf(foundExclusion), 1);
        }
    }

    findColumnindexes(column: TableColumn): TableIndex[] {
        return this.indexes.filter((index) => {
            return !!index.columnNames.find((columnName) => columnName === column.name);
        });
    }

    findColumnForeignKeys(column: TableColumn): TableForeignKey[] {
        return this.foreignKey.filter((foreignKey) => {
            return !!foreignKey.columnNames.find((columnName) => columnName === column.name);
        });
    }

    findColumnUniques(column: TableColumn): TableUnique[] {
        return this.unique.filter((unique) => {
            return !!unique.columnNames.find((columnName) => columnName === column.name);
        });
    }

    findColumnChecks(column: TableColumn): TableCheck[] {
        return this.checks.filter((check) => {
            return !!check.columnNames!.find((columnName) => columnName === column.name);
        });
    }

    getPrimaryColumns(): TableColumn[] {
        return this.columns.filter((col) => col.primary);
    }
}
