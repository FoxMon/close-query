/**
 * `TableForeignKeyOption.ts`
 *
 * ForeignKey에 대한 Option을 지정한다.
 */
export interface TableForeignKeyOption {
    /**
     * 외래키에 대한 이름
     */
    name?: string;

    /**
     * 외래키의 column이름을 지정하도록 한다.
     */
    columnNames: string[];

    /**
     * 참조되고 있는 Database를 지정한다.
     */
    referencedDatabase?: string;

    /**
     * 참조되고 있는 Schema를 지정한다.
     */
    referencedSchema?: string;

    /**
     * 외래키의 Table을 지정한다.
     */
    referencedTableName: string;

    /**
     * 참조되고 있는 Column이름을 지정하도록 한다.
     */
    referencedColumnNames: string[];

    /**
     * 외래키의 "ON DELETE" 설정하도록 한다.
     */
    onDelete?: string;

    /**
     * 외래키의 "ON UPDATE" 설정하도록 한다.
     */
    onUpdate?: string;

    /**
     * 외래키 제약조건 "DEFERRABLE"를 설정하도록 한다.
     */
    deferrable?: string;
}
