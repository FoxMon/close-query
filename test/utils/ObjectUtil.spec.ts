import { describe, test, expect } from 'vitest';
import { ObjectUtil } from '../../src/utils/ObjectUtil';

describe('ObjectUtil.ts', () => {
    test('ObjectUtil.isObject', () => {
        const isObject: boolean = ObjectUtil.isObject({});
        const isNotObject: boolean = ObjectUtil.isObject('abc');

        expect(isObject).toEqual(true);
        expect(isNotObject).toEqual(false);
    });

    test('ObjectUtil.assign', () => {
        const obj = {};

        ObjectUtil.assign(obj, {
            name: 'FoxMon',
            project: 'CQ',
        });

        expect(obj).toEqual({
            name: 'FoxMon',
            project: 'CQ',
        });
    });
});
