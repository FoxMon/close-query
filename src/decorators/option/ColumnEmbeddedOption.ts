/**
 * `ColumnEmbeddedOption.ts`
 *
 * Column에 표현되는 embedded option에 대한 타입을 정의한다.
 */
export interface ColumnEmbeddedOption {
    /**
     * Prefix를 사용할 것인지에 대한 여부를 표현함과 동시에
     * prefix의 이름을 지정한다.
     */
    prefix?: string | boolean;

    /**
     * Array인지?
     */
    array?: boolean;
}
