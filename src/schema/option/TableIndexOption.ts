/**
 * `TableIndexOption.ts`
 *
 * Table의 Index와 관련된 option을 정의한다.
 */
export interface TableIndexOption {
    /**
     * Index의 이름을 지정한다.
     */
    name?: string;

    /**
     * 해당 Index를 포함하고 있는 Column의 이름을 지정한다.
     * 여러 개가 될 가능성이 있기 때문에 string[]으로 지정한다.
     */
    columnNames: string[];

    /**
     * 해당 Index가 Unique한 것인지 판단한다.
     *
     * Default: false
     */
    unique?: boolean;
}
