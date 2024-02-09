/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../manager/Manager';
import { NotWhereSyntax } from '../query/NotWhereSyntax';
import { QueryStore } from '../query/QueryStore';
import { WhereSyntax } from '../query/WhereSyntax';
import { DeleteQueryBuilder } from '../query/builder/DeleteQueryBuilder';
import { InsertQueryBuilder } from '../query/builder/InsertQueryBuilder';
import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';
import { EntitySchema } from '../schema/entity/EntitySchema';
import { Table } from '../schema/table/Table';
import { TableColumn } from '../schema/table/TableColumn';
import { TableForeignKey } from '../schema/table/TableForeignKey';
import { TableIndex } from '../schema/table/TableIndex';
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

    static checkIsInsertQueryBuilder(obj: unknown): obj is InsertQueryBuilder<any> {
        return this.check(obj, 'InsertQueryBuilder');
    }

    static checkIsDeleteQueryBuilder(obj: unknown): obj is DeleteQueryBuilder<any> {
        return this.check(obj, 'DeleteQueryBuilder');
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

    static checkIsTableColumn(obj: unknown): obj is TableColumn {
        return this.check(obj, 'TableColumn');
    }

    static checkIsTableIndex(obj: unknown): obj is TableIndex {
        return this.check(obj, 'TableIndex');
    }

    static checkIsView(obj: unknown): obj is View {
        return this.check(obj, 'View');
    }

    static checkIsWhereSyntax(obj: unknown): obj is WhereSyntax {
        return this.check(obj, 'WhereSyntax');
    }

    static checkIsNotWhereSyntax(obj: unknown): obj is NotWhereSyntax {
        return this.check(obj, 'NotWhereSyntax');
    }

    private static check(obj: unknown, symbol: string) {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            (obj as { _instance: Symbol })['_instance'] === Symbol.for(symbol)
        );
    }
}
