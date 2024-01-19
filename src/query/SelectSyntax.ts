/**
 * `SelectSyntax.ts`
 *
 * Query를 사용할 때 `Select` 문법을 위한 interface를 정의하도록 한다.
 */
export interface SelectSyntax {
    /**
     * `Select` query에 해당하는 문법을 정의한다.
     */
    select: string;

    /**
     * `Select`를 할 때 Alias를 정의한다.
     */
    aliasName?: string;

    /**
     * Virtual인지?
     */
    virtual?: boolean;
}
