import { TableConstraintOption } from '../option/TableConstraintOption';

/**
 * `TableConstraint.ts`
 */
export class TableConstraint {
    readonly '_instance' = Symbol.for('TableConstraint');

    name?: string;

    columnNames?: string[] = [];

    expression?: string;

    constructor(option: TableConstraintOption) {
        this.name = option.name;
        this.columnNames = option.columnNames;
        this.expression = option.expression;
    }

    createTableConstraint(): TableConstraint {
        return new TableConstraint(<TableConstraintOption>{
            name: this.name,
            columnNames: this.columnNames,
            expression: this.columnNames,
        });
    }
}
