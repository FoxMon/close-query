import { TableForeignKeyOption } from '../option/TableForeignKeyOption';

/**
 * `TableForeignKey.ts`
 *
 * Database에 저장된 ForeignKey에 대한 class 정의.
 */
export class TableForeignKey {
    readonly '_instance' = Symbol.for('TableForeignKey');

    name?: string;

    columnNames: string[] = [];

    referencedDatabase?: string;

    referencedSchema?: string;

    referencedTableName: string;

    referencedColumnNames: string[] = [];

    onDelete?: string;

    onUpdate?: string;

    deferrable?: string;

    constructor(option: TableForeignKeyOption) {
        this.name = option.name;
        this.columnNames = option.columnNames;
        this.referencedDatabase = option.referencedDatabase;
        this.referencedSchema = option.referencedSchema;
        this.referencedTableName = option.referencedTableName;
        this.referencedColumnNames = option.referencedColumnNames;
        this.onDelete = option.onDelete;
        this.onUpdate = option.onUpdate;
        this.deferrable = option.deferrable;
    }

    createTableForeignKey(): TableForeignKey {
        return new TableForeignKey(<TableForeignKeyOption>{
            name: this.name,
            columnNames: [...this.columnNames],
            referencedDatabase: this.referencedDatabase,
            referencedSchema: this.referencedSchema,
            referencedTableName: this.referencedTableName,
            referencedColumnNames: [...this.referencedColumnNames],
            onDelete: this.onDelete,
            onUpdate: this.onUpdate,
            deferrable: this.deferrable,
        });
    }
}
