/**
 * `TableUniqueOption.ts`
 *
 * Database의 Table 제약 조건 중 Unique에 대한 Option을 정의한다.
 */
export interface TableUniqueOption {
    /**
     * 제약조건에 대한 이름을 지정한다.
     */
    name?: string;

    /**
     * 제약조건을 포함하고 있는 Column의 이름을 정의한다.
     */
    columnNames: string[];

    /**
     * Setting DEFFARABLE
     */
    defferable?: string;
}
