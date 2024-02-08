/* eslint-disable @typescript-eslint/no-explicit-any */

import { Manager } from '../../manager/Manager';
import { SelectQueryBuilder } from '../../query/builder/SelectQueryBuilder';

/**
 * `ViewOption.ts`
 *
 * Database에서 View를 표현하는 option을 정의하도록 한다.
 */
export interface ViewOption {
    /**
     * Database의 이름을 받아온 후
     * view에 삽입하도록 한다.
     */
    database?: string;

    /**
     * 어떠한 Schema에서 이루어지고 있는지
     * 알아야 하므로 지정하도록 한다.
     */
    schema?: string;

    /**
     * View의 이름을 지정하도록 한다.
     */
    name: string;

    /**
     * View expression
     */
    expression: string | ((manager: Manager) => SelectQueryBuilder<any>);

    /**
     * View가 materialized가 되는지 표현하도록 한다.
     */
    materialized?: boolean;
}
