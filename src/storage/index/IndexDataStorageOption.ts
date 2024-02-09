/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * `IndexDataStorageOption.ts`
 *
 * Index에 관련된 Option을 정의한다.
 */
export interface IndexDataStorageOption {
    /**
     * Index가 적용될 target에 대한 정보를 포함한다.
     */
    target: Function | string;

    /**
     * Index 이름을 정의한다.
     */
    name?: string;

    /**
     * Column에 대한 정보를 명시한다.
     */
    columns?: ((object?: any) => any[] | { [key: string]: number }) | string[];

    /**
     * Unique인가?
     */
    unique?: boolean;

    /**
     * `SPATIAL`
     */
    spatial?: boolean;

    /**
     * `FULLTEXT`
     */
    fulltext?: boolean;

    /**
     * NULL_FILTERED 인덱스
     */
    nullFiltered?: boolean;

    /**
     * Fulltext parser.
     * `MySQL`
     */
    parser?: string;

    /**
     * Index의 filter 조건을 명시한다.
     */
    where?: string;

    /**
     * Sync를 맞출지에 대한 필드를 정의한다.
     */
    synchronize?: boolean;

    /**
     * `mongodb`
     */
    sparse?: boolean;

    /**
     * `mongodb`
     */
    background?: boolean;

    /**
     * Index의 Concurrently option을 사용할지에 대한 엽무를 판단한다.
     * `postgres` database.
     */
    concurrent?: boolean;

    /**
     * Index가 만료될 시간을 명시한다.
     * `mongodb`
     */
    expireAfterSeconds?: number;
}
