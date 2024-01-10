/* eslint-disable @typescript-eslint/ban-types */

/**
 * `Column.ts`
 *
 * Database에서 특정 어느 Table의 Column을 정의할 때 사용하는
 * Decorator를 정의한다.
 */

/**
 * Column decorator는 특정 Table의 어떠한 column에 붙는 decorator이다.
 * 표현하고자 하는 class 내부의 property에 사용할 수 있다.
 */
export function Column(): PropertyDecorator;

/**
 * Column decorator는 특정 Table의 어떠한 column에 붙는 decorator이다.
 * 표현하고자 하는 class 내부의 property에 사용할 수 있다.
 */
export function Column(): PropertyDecorator {
    return function (obj: Object, propertyName: string) {};
}
