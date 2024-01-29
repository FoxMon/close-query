/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../manager/Manager';
import { QueryStore } from '../query/QueryStore';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { EntitySchema } from '../schema/entity/EntitySchema';

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

    static checkIsCQDataStorage(obj: unknown): obj is EntitySchema {
        return this.check(obj, 'EntitySchema');
    }

    static checkIsQueryStore(obj: unknown): obj is QueryStore {
        return this.check(obj, 'QueryStore');
    }

    private static check(obj: unknown, symbol: string) {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            (obj as { _instance: Symbol })['_instance'] === Symbol.for(symbol)
        );
    }
}
