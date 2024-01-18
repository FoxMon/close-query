import { describe, expect, test } from 'vitest';
import { CheckerUtil } from '../../src/utils/CheckerUtil';
import { Manager } from '../../src/manager/Manager';

describe('CheckUtil.ts', () => {
    test('CheckUtil checkIsManager Manager is true', () => {
        const manager: Manager = new Manager({
            type: 'mysql',
        });

        const isManager: boolean = CheckerUtil.checkIsManager(manager);

        expect(isManager).toBe(true);
    });

    test('CheckUtil checkIsManager Manager is false', () => {
        const isManager: boolean = CheckerUtil.checkIsManager({});

        expect(isManager).toBe(false);
    });
});
