/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../manager/Manager';
import { QueryStore } from '../query/QueryStore';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { EntitySchema } from '../schema/entity/EntitySchema';
import { Table } from '../schema/table/Table';
import { TableForeignKey } from '../schema/table/TableForeignKey';
import { View } from '../schema/view/View';
import { CQDataStorage } from '../storage/CQDataStorage';

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

    static checkIsCQDataStorage(obj: unknown): obj is CQDataStorage {
        return this.check(obj, 'CQDataStorage');
    }

    static checkIsQueryStore(obj: unknown): obj is QueryStore {
        return this.check(obj, 'QueryStore');
    }

    static checkIsEntitySchema(obj: unknown): obj is EntitySchema {
        return this.check(obj, 'EntitySchema');
    }

    static checkIsTable(obj: unknown): obj is Table {
        return this.check(obj, 'Table');
    }

    static checkIsTableForeignKey(obj: unknown): obj is TableForeignKey {
        return this.check(obj, 'TableForeignKey');
    }

    static checkIsView(obj: unknown): obj is View {
        return this.check(obj, 'View');
    }

    private static check(obj: unknown, symbol: string) {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            (obj as { _instance: Symbol })['_instance'] === Symbol.for(symbol)
        );
    }
}
