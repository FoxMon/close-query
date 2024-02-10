import { ValueTransformer } from '../../types/ValueTransformer';
import { ColumnType } from '../../types/column/ColumType';

/**
 * `VirtualColumnOptions.ts`
 */
export interface VirtualColumnOptions {
    /**
     * Column의 Type을 명시한다.
     */
    type?: ColumnType;

    /**
     * HSTORE column을 명시한다.
     * Object 혹은 String을 반환하도록 한다.
     */
    hstoreType?: 'object' | 'string';

    /**
     * Query를 실행시킬 함수 타입을 명시한다.
     */
    query: (alias: string) => string;

    /**
     * Transformer(s)
     */
    transformer?: ValueTransformer | ValueTransformer[];
}
