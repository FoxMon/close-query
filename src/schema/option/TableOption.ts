import { TableCheckOption } from '../table/TableCheckOption';
import { TableExclusionOption } from '../table/TableExclusionOption';
import { TableCloumnOption } from './TableColumnOption';
import { TableForeignKeyOption } from './TableForeignKeyOption';
import { TableIndexOption } from './TableIndexOption';
import { TableUniqueOption } from './TableUniqueOption';

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
     * Table에 걸린 제약조건 중 Unique를 표현하는 필드이다.
     */
    unique?: TableUniqueOption[];

    /**
     * Table의 Check 제약조건.
     */
    checks?: TableCheckOption[];

    /**
     * Table의 Exclusion 제약조건.
     */
    exclusions?: TableExclusionOption[];

    /**
     * Table이 단순히 만들어 지는지를 나타내도록 한다.
     * 새로운 Table을 만들 때 PK를 생성하고 싶지 않을 때 사용한다.
     */
    justCreated?: boolean;

    /**
     * WITHOUT ROWID
     */
    withoutRowid?: boolean;

    /**
     * Table engine
     */
    engine?: string;

    /**
     * Comment
     */
    comment?: string;
}
