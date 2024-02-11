import { OnDeleteType } from '../../storage/types/OnDeleteType';
import { OnUpdateType } from '../../storage/types/OnUpdateType';
import { DeferrableType } from '../../types/DeferrableType';

/**
 * `RelationOption.ts`
 */
export interface RelationOption {
    /**
     * Cascade option을 명시하도록 한다.
     * 주어진 관계성에서 어떠한 Cascade option을 명시할 것인지 설정한다.
     *
     * ["insert", "update", "remove", "soft-remove", "recover"]
     */
    cascade?: boolean | ('insert' | 'update' | 'remove' | 'soft-remove' | 'recover')[];

    /**
     * Null을 허용할 것인가?
     */
    nullable?: boolean;

    /**
     * DELETE 액션이 발생할 경우 취할 행동을 명시한다.
     */
    onDelete?: OnDeleteType;

    /**
     * UPDATE 액션이 발생할 경우 취할 행동을 명시한다.
     */
    onUpdate?: OnUpdateType;

    /**
     * DEFERRABLE
     */
    deferrable?: DeferrableType;

    /**
     * FK 제약조건 명시를 위한 필드이다.
     */
    createForeignKeyConstraints?: boolean;

    /**
     * Lazy load option을 명시한다.
     */
    lazy?: boolean;

    /**
     * Eager load option을 명시한다.
     */
    eager?: boolean;

    /**
     * Persistence option을 명시한다.
     */
    persistence?: boolean;

    orphanedRowAction?: 'nullify' | 'delete' | 'soft-delete' | 'disable';
}
