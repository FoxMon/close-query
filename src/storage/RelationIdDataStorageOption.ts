/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { SelectQueryBuilder } from '../query/builder/SelectQueryBuilder';

/**
 * `RelationIdDataStorageOption.ts`
 */
export interface RelationIdDataStorageOption {
    readonly target: Function | string;

    readonly propertyName: string;

    readonly relation: string | ((object: any) => any);

    readonly alias?: string;

    readonly queryBuilderFactory?: (qb: SelectQueryBuilder<any>) => SelectQueryBuilder<any>;
}
