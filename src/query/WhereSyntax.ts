/* eslint-disable @typescript-eslint/no-explicit-any */

import { WhereExpressionBuilder } from './builder/WhereExpressionBuilder';

/**
 * `WhereSyntax.ts`
 *
 * `Where`조건을 쓸 때 문법 오류를 막아주기 위한 class를 정의하도록 한다.
 * 또한 Where 조건을 효율적으로 사용할 수 있도록 한다.
 */
export class WhereSyntax {
    readonly '_instance' = Symbol.for('WhereSyntax');

    where: (queryBuilder: WhereExpressionBuilder) => any;

    constructor(where: (queryBuilder: WhereExpressionBuilder) => any) {
        this.where = where;
    }
}
