/**
 * `TableRelationKeyOption.ts`
 *
 * Table 사이의 관계성을 맺을 때 사용되는 option을 정의한다.
 */
export interface TableRelationKeyOption {
    /**
     * Foreign Key 제약 조건을 사용할 때,
     * 정의되는 제약 조건에 대한 이름이다.
     */
    name?: string;

    /**
     * Foreign Key를 사용할 때 포함되는 Column의 이름을
     * 정의하도록 한다.
     */
    columnNames: string[];

    /**
     * 어떠한 Database에서 Foreign Key를 사용하고 있는지
     * 정의하는 필드이다.
     */
    refDatabase: string;

    /**
     * 어떠한 Schema에서 Foreign Key를 사용하고 있는지 정의한다.
     */
    refSchema: string;

    /**
     * 어떠한 Table에서 Foreign Key를 사용하고 있는지 정의한다.
     */
    refTable: string;

    /**
     * 참조하고 있는 Column의 이름을 정의한다.
     */
    refColumnNames: string[];

    /**
     * [UPDATE] Query를 사용할 때 어떠한 Action을 취할지,
     * option을 정의한다.
     */
    udpateAction?: string;

    /**
     * [DELETE] Query를 사용할 때 어떠한 Action을 취할지,
     * option을 정의한다.
     */
    deleteAction?: string;
}
