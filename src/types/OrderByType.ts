/**
 * `OrderByType.ts`
 *
 * SQL에서 Order by 사용 시 사용하는 type 정의
 */
export type OrderByType = {
    [columnName: string]:
        | ('ASC' | 'DESC')
        | {
              order: 'ASC' | 'DESC';
              nulls?: 'NULLS FIRST' | 'NULLS LAST';
          };
};
