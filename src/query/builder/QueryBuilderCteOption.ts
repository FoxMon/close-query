/**
 * `QueryBuilderCteOption.ts`
 */
export interface QueryBuilderCteOption {
    /**
     * Supported only by Postgres currently
     */
    materialized?: boolean;

    /**
     * Supported by Postgres, SQLite, MySQL and MariaDB
     * SQL Server가 자동적으로 recursive query를 발견한다.
     */
    recursive?: boolean;

    /**
     * Column의 이름들을 Overwrite 한다.
     */
    columnNames?: string[];
}
