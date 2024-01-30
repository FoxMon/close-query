import { TableRelationKeyOption } from '../option/TableRelationKeyOption';

/**
 * `TableRelationKey.ts`
 *
 * Table 사이의 관계성을 맺을 때 사용되는 class를 정의한다.
 */
export class TableRelationKey {
    readonly '_instance' = Symbol.for('TableRelationKey');

    name?: string;

    columnNames?: string[];

    refDatabase: string;

    refSchema: string;

    refTable: string;

    refColumnNames: string[];

    updateAction?: string;

    deleteAction?: string;

    constructor(options: TableRelationKeyOption) {
        if (options) {
            this.name = options.name;

            this.columnNames = options.columnNames;

            this.refDatabase = options.refDatabase;

            this.refSchema = options.refSchema;

            this.refTable = options.refTable;

            this.refColumnNames = options.refColumnNames;

            this.updateAction = options.udpateAction;

            this.deleteAction = options.deleteAction;
        }
    }
}
