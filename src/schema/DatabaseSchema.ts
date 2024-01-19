/**
 * `DatabaseSchema.ts`
 *
 * Entity의 Metadata를 활용하여 Database의 Schema Table을
 * 생성하도록 한다.
 */
export interface DatabaseSchema {
    /**
     * Schema를 만들어 내도록 한다.
     */
    build(): Promise<void>;
}
