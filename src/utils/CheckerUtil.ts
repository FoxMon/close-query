/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../manager/Manager';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';

/**
 * `CheckerUtil.ts`
 *
 * Symbol을 활용하여 Instance를 체크하도록 한다.
 */
export class CheckerUtil {
    readonly '_instance' = Symbol.for('CheckerUtil');

    static checkIsManager(obj: unknown): obj is Manager {
        return this.check(obj, 'Manager');
    }

    static checkIsSelectQueryBuilder(obj: unknown): obj is SelectQueryBuilder<any> {
        return this.check(obj, 'SelectQueryBuilder');
    }

    private static check(obj: unknown, symbol: string) {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            (obj as { _instance: Symbol })['_instance'] === Symbol.for(symbol)
        );
    }
}
