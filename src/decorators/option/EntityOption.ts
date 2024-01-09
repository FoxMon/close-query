/**
 * `EntityOption.ts`
 *
 * Entity decorator에서 사용하는 option을 정의한다.
 */
export interface EntityOption {
    /**
     * Database의 이름을 명시한다.
     */
    database?: string;

    /**
     * Schema의 이름을 명시한다.
     */
    schema?: string;

    /**
     * Table의 이름을 명시하도록 한다.
     */
    name?: string;
}
