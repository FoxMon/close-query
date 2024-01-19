/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectIndexType } from '../../types/ObjectIndexType';
import { WhereSyntax } from '../WhereSyntax';

/**
 * `WhereExpressionBuilder.ts`
 *
 * QueryBuilder 이용 시 `Where` 구문을 쓸 때 사용할 함수들을 정의하도록 한다.
 */
export interface WhereExpressionBuilder {
    /**
     * `Where` 조건을 사용할 함수를 정의한다.
     * 이전에 이미 `Where`조건(함수) 을(를) 사용했을 경우,
     * Overriding이 될 수 있도록 한다.
     *
     * Parameter를 활용하여 `Where`조건을 명시할 수 있도록 한다.
     */
    where(w: string, params?: ObjectIndexType): this;

    /**
     * `Where` 조건을 사용할 함수를 정의한다.
     * 이전에 이미 `Where`조건(함수) 을(를) 사용했을 경우,
     * Overriding이 될 수 있도록 한다.
     *
     * Parameter를 활용하여 `Where`조건을 명시할 수 있도록 한다.
     */
    where(w: WhereSyntax, params?: ObjectIndexType): this;

    /**
     * `Where` 조건을 사용할 함수를 정의한다.
     * 이전에 이미 `Where`조건(함수) 을(를) 사용했을 경우,
     * Overriding이 될 수 있도록 한다.
     *
     * Parameter를 활용하여 `Where`조건을 명시할 수 있도록 한다.
     */
    where(where: ObjectIndexType, params?: ObjectIndexType): this;

    /**
     * `Where` 조건을 사용할 함수를 정의한다.
     * 이전에 이미 `Where`조건(함수) 을(를) 사용했을 경우,
     * Overriding이 될 수 있도록 한다.
     *
     * Parameter를 활용하여 `Where`조건을 명시할 수 있도록 한다.
     */
    where(where: ObjectIndexType[], params?: ObjectIndexType): this;

    /**
     * `Where` 조건을 사용할 함수를 정의한다.
     * 이전에 이미 `Where`조건(함수) 을(를) 사용했을 경우,
     * Overriding이 될 수 있도록 한다.
     *
     * Parameter를 활용하여 `Where`조건을 명시할 수 있도록 한다.
     */
    where(subQuery: (qb: this) => string, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `AND` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    andWhere(where: string, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `AND` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    andWhere(where: WhereSyntax, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `AND` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    andWhere(where: ObjectIndexType, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `AND` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    andWhere(where: ObjectIndexType[], params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `AND` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    andWhere(subQuery: (qb: this) => string, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `OR` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    orWhere(where: string, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `OR` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    orWhere(where: WhereSyntax, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `OR` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    orWhere(where: ObjectIndexType, params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `OR` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    orWhere(where: ObjectIndexType[], params?: ObjectIndexType): this;

    /**
     * 기존의 `Where`조건에 `OR` 조건을 추가하도록 한다.
     * 또한 Parameter와 함께 조건식을 작성할 수 있도록 한다.
     */
    orWhere(subQuery: (qb: this) => string, params?: ObjectIndexType): this;

    /**
     * `Where`조건에 `IN` 조건을 추가하도록 한다.
     * 어떠한 형태로든 들어와도 성립이 가능하도록 한다.
     */
    whereInIds(ids: any | any[]): this;

    /**
     * `Where`조건에 `IN`과 `AND` 조건을 추가하도록 한다.
     * 어떠한 형태로든 들어와도 성립이 가능하도록 한다.
     */
    andWhereInIds(ids: any | any[]): this;

    /**
     * `Where`조건에 `IN`과 `OR` 조건을 추가하도록 한다.
     * 어떠한 형태로든 들어와도 성립이 가능하도록 한다.
     */
    orWhereInIds(ids: any | any[]): this;
}
