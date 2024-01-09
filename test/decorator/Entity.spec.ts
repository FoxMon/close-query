import { describe, test, expect } from 'vitest';
import { Entity } from '../../src/decorators/entity/Entity';
import { getStaticStorage } from '../../src/storage/static';
import { TableDataStorage } from '../../src/storage/table/TableDataStorage';

describe('Entity.ts', () => {
    test('Entity decorator & StaticStorage', () => {
        @Entity({
            database: 'FoxMonDB',
            schema: 'foxmon',
            name: 'FoxMonTable',
        })
        class Table {
            name: string;

            age: number;

            constructor(name: string, age: number) {
                this.name = name;

                this.age = age;
            }
        }

        const global = getStaticStorage();

        expect(global.tables.length).toBe(1);

        const table = global.tables.pop() as TableDataStorage;

        expect(table.database).toEqual('FoxMonDB');
        expect(table.schema).toEqual('foxmon');
        expect(table.name).toEqual('FoxMonTable');
        expect(table.targetTable).toEqual(Table);
    });
});
