import { CheckDataStorage } from '../../storage/CheckDataStorage';
import { TableCheckOption } from './TableCheckOption';

/**
 * `TableCheck.ts`
 *
 * Database에서 Table check 제약조건을 저장할 class를 정의하도록 한다.
 */
export class TableCheck {
    readonly _instanceof = Symbol.for('TableCheck');

    name?: string;

    columnNames?: string[] = [];

    expression?: string;

    constructor(options: TableCheckOption) {
        this.name = options.name;
        this.columnNames = options.columnNames;
        this.expression = options.expression;
    }

    create(): TableCheck {
        return new TableCheck(<TableCheckOption>{
            name: this.name,
            columnNames: this.columnNames ? [...this.columnNames] : [],
            expression: this.expression,
        });
    }

    static create(checkMetadata: CheckDataStorage): TableCheck {
        return new TableCheck(<TableCheckOption>{
            name: checkMetadata.name,
            expression: checkMetadata.expression,
        });
    }
}
