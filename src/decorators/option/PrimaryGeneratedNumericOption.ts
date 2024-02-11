import { PrimaryGeneratedColumnType } from '../../types/column/ColumType';

/**
 * `PrimaryGeneratedNumericOption.ts`
 */
export interface PrimaryGeneratedNumericOption {
    /**
     * Column에 대한 Type을 명시한다.
     * ColumnType에 있는 한가지만 가능하도록 한다.
     */
    type?: PrimaryGeneratedColumnType;

    /**
     * Database에 있는 Column에 대한 이름을 명시한다.
     */
    name?: string;

    /**
     * Comment를 명시하도록 한다.
     */
    comment?: string;

    /**
     * ZEROFILL
     */
    zerofill?: boolean;

    /**
     * UNSIGNED
     */
    unsigned?: boolean;

    /**
     * PK에 대한 제약조건에 대한 이름을 명시하도록 한다.
     */
    primarykeyConstraintName?: string;
}
