import { ColumnDataStorage } from '../column/ColumnDataStorage';

/**
 * `ClosureTreeOptions.ts`
 */
export interface ClosureTreeOption {
    closureTableName?: string;
    ancestorColumnName?: (column: ColumnDataStorage) => string;
    descendantColumnName?: (column: ColumnDataStorage) => string;
}
