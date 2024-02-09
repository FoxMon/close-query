import { Naming } from '../naming/Naming';
import { DeferrableType } from '../types/DeferrableType';
import { CQDataStorage } from './CQDataStorage';
import { ColumnDataStorage } from './column/ColumnDataStorage';
import { OnDeleteType } from './types/OnDeleteType';
import { OnUpdateType } from './types/OnUpdateType';

/**
 * `ForeignKeyDataStorage.ts`
 */
export class ForeignKeyDataStorage {
    dataStorage: CQDataStorage;

    referencedDataStorage: CQDataStorage;

    columns: ColumnDataStorage[] = [];

    referencedColumns: ColumnDataStorage[] = [];

    onDelete?: OnDeleteType;

    onUpdate?: OnUpdateType;

    deferrable?: DeferrableType;

    referencedTablePath: string;

    name: string;

    columnNames: string[] = [];

    referencedColumnNames: string[] = [];

    givenName?: string;

    constructor(options: {
        entityMetadata: CQDataStorage;
        referencedEntityMetadata: CQDataStorage;
        naming?: Naming;
        columns: ColumnDataStorage[];
        referencedColumns: ColumnDataStorage[];
        onDelete?: OnDeleteType;
        onUpdate?: OnUpdateType;
        deferrable?: DeferrableType;
        name?: string;
    }) {
        this.dataStorage = options.entityMetadata;
        this.referencedDataStorage = options.referencedEntityMetadata;
        this.columns = options.columns;
        this.referencedColumns = options.referencedColumns;
        this.onDelete = options.onDelete || 'NO ACTION';
        this.onUpdate = options.onUpdate || 'NO ACTION';
        this.deferrable = options.deferrable;
        this.givenName = options.name;

        if (options.naming) {
            this.build(options.naming);
        }
    }

    build(naming: Naming) {
        this.columnNames = this.columns.map((column) => column.databaseName);
        this.referencedColumnNames = this.referencedColumns.map((column) => column.databaseName);
        this.referencedTablePath = this.referencedDataStorage.tablePath;
        this.name = this.givenName
            ? this.givenName
            : naming.foreignKeyName(
                  this.dataStorage.tableName,
                  this.columnNames,
                  this.referencedDataStorage.tableName,
                  this.referencedColumnNames,
              );
    }
}
