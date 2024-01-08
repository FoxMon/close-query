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
}
