import { describe, test, expect } from 'vitest';
import { StringUtil } from '../../utils/StringUtil';

describe('StringUtil.ts', () => {
    test('StringUtil.toCamelCase()', () => {
        const camelCaseStr: string = StringUtil.toCamelCase('TypeScript');

        expect(camelCaseStr).toEqual('typeScript');
    });

    test('StringUtil.toSnakeCase()', () => {
        const snake_case: string = StringUtil.toSnakecase('TypeScript');

        expect(snake_case).toEqual('type_script');
    });

    test('StringUtil.toTitleCase()', () => {
        const TitleCase: string = StringUtil.toTitleCase('fox mon');

        expect(TitleCase).toEqual('Fox Mon');
    });
});
