import { TableCloumnOption } from '../option/TableColumnOption';
import { TableIndexOption } from '../option/TableIndexOption';
import { TableOption } from '../option/TableOption';
import { TableColumn } from './TableColumn';
import { TableIndex } from './TableIndex';

/**
 * `Table.ts`
 *
 * Table에 관련된 로직들을 정의하도록 한다.
 * 외래키, 유니크, 인덱스 etc ...
 */
export class Table {
    readonly 'instance' = Symbol.for('Table');

    database?: string;

    schema?: string;

    name: string;

    columns: TableColumn[] = [];

    indexes: TableIndex[] = [];

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
        }
    }

    createTable(): Table {
        return new Table({
            database: this.database,
            schema: this.schema,
            name: this.name,
            columns: this.columns.map((col: TableColumn) => col.createTableColumn()),
            indexes: this.indexes.map((idx: TableIndex) => idx.createTableIndex()),
        });
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
}
