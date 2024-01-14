import { describe, expect, test } from 'vitest';
import { Entity } from '../../src/decorators/entity/Entity';
import { Column } from '../../src/decorators/column/Column';
import { getStaticStorage } from '../../src/storage/static';
import { TableDataStorage } from '../../src/storage/table/TableDataStorage';

describe('Column.ts', () => {
    test('Column decorator with object options & StaticStorage', () => {
        @Entity('article')
        class Article {
            @Column({
                type: 'varchar',
                primary: true,
                primaryKeyName: 'pk_article_title',
                nullable: false,
            })
            title: string;

            @Column({
                type: 'varchar',
                unique: true,
                nullable: false,
            })
            contents: string;

            @Column({
                type: 'varchar',
                nullable: true,
            })
            author: string;

            constructor(title: string, contents: string, author: string) {
                this.title = title;

                this.contents = contents;

                this.author = author;
            }
        }

        const global = getStaticStorage();

        const table = global.tables.pop() as TableDataStorage;
        const columns = global.columns;

        expect(table.targetTable).toEqual(Article);

        const options = [
            {
                type: 'varchar',
                primary: true,
                primaryKeyName: 'pk_article_title',
                nullable: false,
            },
            {
                type: 'varchar',
                unique: true,
                nullable: false,
            },
            {
                type: 'varchar',
                nullable: true,
            },
        ];

        columns.forEach((col, idx) => {
            expect(col.options).toEqual(options[idx]);
        });
    });
});
