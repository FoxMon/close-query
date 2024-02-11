/**
 * `PrimaryGeneratedUUIDOption.ts`
 */
export interface PrimaryGeneratedUUIDOption {
    /**
     * Database의 Column의 이름을 명시한다.
     */
    name?: string;

    /**
     * Column에 대한 comment를 명시한다.
     */
    comment?: string;

    /**
     * PK제약조건에 대한 이름을 명시한다.
     */
    primarykeyConstraintName?: string;
}
