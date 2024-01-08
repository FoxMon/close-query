import { describe, test, expect } from 'vitest';
import { Table } from '../../src/schema/table/Table';
import { TableColumn } from '../../src/schema/table/TableColumn';
import { TableIndex } from '../../src/schema/table/TableIndex';

describe('Table.ts', () => {
    test('Table.createTable()', () => {
        const table: Table = new Table({
            database: 'mysql',
            schema: 'foxmon',
            name: 'foxmon_table',
            columns: [
                new TableColumn({
                    name: 'user_name',
                    type: 'varchar',
                    default: 'FoxMon',
                    nullable: false,
                    unique: true,
                    length: '',
                    width: 100,
                    collation: '',
                    precision: null,
                    scale: 10,
                }),
            ],
            indexes: [
                new TableIndex({
                    name: 'idx_user_name',
                    columnNames: ['user_name'],
                    unique: true,
                }),
            ],
        });

        const clonedTable: Table = table.createTable();

        expect(table).toEqual(clonedTable);
    });
});
