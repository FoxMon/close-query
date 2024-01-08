import { describe, test, expect } from 'vitest';
import { DefaultNaming } from '../../src/naming/DefaultNaming';

describe('DefaultNaming.ts', () => {
    test('DefaultNaming.getColumnName()', () => {
        const defaultNaming: DefaultNaming = new DefaultNaming();

        const columnName: string = defaultNaming.getColumnName('article', 'Article', ['hbtb']);

        expect(columnName).toEqual('hbtbArticle');
    });
});
