import { TableCloumnOption } from './TableColumnOption';
import { TableConstraintOption } from './TableConstraintOption';
import { TableForeignKeyOption } from './TableForeignKeyOption';
import { TableIndexOption } from './TableIndexOption';

/**
 * `TableOption.ts`
 *
 * Table에 관련된 option을 정의하도록 한다.
 */
export interface TableOption {
    /**
     * 어떠한 Database에 속한 것인지 정의하도록 한다.
     *
     * foxdb.db.table ...
     */
    database?: string;

    /**
     * Database의 어떠한 schema에 정의된 것인지 초기화 하도록 한다.
     */
    schema?: string;

    /**
     * Table의 이름을 정의한다.
     */
    name: string;

    /**
     * Table의 Column들을 지정한다.
     */
    columns: TableCloumnOption[];

    /**
     * Column에서 지정한 Index를 표현하는 필드이다.
     */
    indexes: TableIndexOption[];

    /**
     * Table에 대한 FK를 표현하는 필드이다.
     */
    foreignKey?: TableForeignKeyOption[];

    /**
     * Table에 걸린 제약조건을 표현하는 필드이다.
     */
    constraint?: TableConstraintOption[];
}
