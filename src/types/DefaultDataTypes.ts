/**
 * `DefaultDataTypes.ts`
 *
 * Database에서 사용되는 기본적인 Datatypes에 대한 Type.
 */
export interface DefaultDataTypes {
    [type: string]: {
        /**
         * varchar와 같은 type의 length
         */
        length?: number;

        /**
         * 전체 자리 수
         */
        precision?: number;

        /**
         * 소수점의 자리 수
         */
        scale?: number;

        /**
         * Data의 width
         */
        width?: number;
    };
}
