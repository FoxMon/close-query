import { TableUniqueOption } from '../option/TableUniqueOption';

/**
 * `TableUnique.ts`
 *
 * Database의 Table 제약 조건 중 Unique에 대한
 * class를 정의하도록 한다.
 */
export class TableUnique {
    readonly '_instance' = Symbol.for('TableUnique');

    name?: string;

    columnNames: string[] = [];

    defferable?: string;

    constructor(option: TableUniqueOption) {
        this.name = option.name;
        this.columnNames = option.columnNames;
        this.defferable = option.defferable;
    }

    createTableUnique() {
        return new TableUnique(<TableUniqueOption>{
            name: this.name,
            columnNames: this.columnNames,
            defferable: this.defferable,
        });
    }
}
