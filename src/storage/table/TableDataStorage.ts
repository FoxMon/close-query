/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../../manager/Manager';
import { SelectQueryBuilder } from '../../query/builder/SelectQueryBuilder';
import { OrderByType } from '../../types/OrderByType';

/**
 * `TableDataStorage.ts`
 *
 * Table Data에 관련된 Storage를 정의할 때 사용될 interface를 작성한다.
 */
export interface TableDataStorage {
    /**
     * Database의 이름을 명시한다.
     */
    database?: string;

    /**
     * Schema의 이름을 명시한다.
     */
    schema?: string;

    /**
     * Table의 이름을 명시하도록 한다.
     */
    name?: string;

    /**
     * Target이 될 Table class를 명시할 필드인데,
     * Function이 되어야 하는 이유는 JavaScript에서는 Class도 Function type 이기 떄문이다.
     */
    targetTable: Function | string;

    /**
     * Expression
     */
    expression?: string | ((manager: Manager) => SelectQueryBuilder<any>);

    /**
     * View가 materialized가 되는지 표현하도록 한다.
     */
    materialized?: boolean;

    /**
     * Order by 옵션을 설정해 주지 않았을 때 Default로 지정할 Order by 속성을 명시한다.
     */
    orderBy?: OrderByType | ((obj: any) => OrderByType | any);
}
