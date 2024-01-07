/**
 * `StringUtil.ts`
 */
export class StringUtil {
    readonly '_instance' = Symbol.for('Stringutil');

    /**
     * 주어진 String을 `camelCase`로 변환한다.
     *
     * @param {string} v
     * @returns {string}
     */
    static toCamelCase(v: string): string {
        return v.replace(/^([A-Z])|[\s-_](\w)/g, (_, el1: string, el2: string) => {
            if (el2) {
                return el2.toUpperCase();
            }

            return el1.toLowerCase();
        });
    }

    /**
     * 주어진 String을 `snake_case`로 변환한다.
     *
     * @param {string} v
     * @returns {string}
     */
    static toSnakecase(v: string): string {
        return (
            v
                // Abc -> a_bc
                .replace(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
                // aB -> a_b
                .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
                .toLowerCase()
        );
    }
}
