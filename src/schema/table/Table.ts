import { TableOption } from '../option/TableOption';

/**
 * `Table.ts`
 *
 * Table에 관련된 로직들을 정의하도록 한다.
 * 외래키, 유니크, 인덱스 etc ...
 */
export class Table {
    readonly 'instance' = Symbol.for('Table');

    database?: string;

    schema?: string;

    name: string;

    constructor(options: TableOption) {
        if (options) {
            const { database, schema, name } = options;

            this.database = database;

            this.schema = schema;

            this.name = name;
        }
    }
}
