/**
 * `CteCapabilities.ts`
 */
export interface CteCapabilities {
    /**
     * CTEs를 지원하는가?
     */
    enabled: boolean;

    /**
     * CTE를 쓸 수 있는가?
     */
    writable?: boolean;

    /**
     * RECURSIVE에 대한 힌트를 제공하는가?
     */
    requiresRecursiveHint?: boolean;

    /**
     * MATERIALIZED 를 지원하는가?
     */
    materializedHint?: boolean;
}
