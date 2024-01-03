/**
 * `ObjectUtil.ts`
 */
export class ObjectUtil {
    /**
     * 주어진 value가 Object인지 검사한다.
     * 주의할 것은 `typeof nul === "object"` 이므로, Object로 검사하도록 한다.
     * Object가 아니라면 다른 맥락으로 위험한 상황이 야기될 수 있으므로 주의한다.
     *
     * @param {unknown} v
     * @returns {boolean}
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    static isObject(v: unknown): v is Object {
        return v !== null && typeof v === 'object';
    }
}
