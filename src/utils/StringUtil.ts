import shajs from 'sha.js';

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

    /**
     * 주어진 String을 `TitleCase`로 변환한다.
     *
     * fox mon -> Fox Mon
     *
     * @param {string} v
     * @returns {string}
     */
    static toTitleCase(v: string): string {
        return v.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
        );
    }

    /**
     * 주어진 string값을 DB에서 유용하게 사용할 수 있도록
     * alias를 하기 위한 함수이다.
     *
     * @param {string} str
     * @param option
     * @returns {string}
     */
    static toShorten(
        str: string,
        option: {
            separator?: string;
            segmentLength?: number;
            termLength?: number;
        } = {},
    ): string {
        const { segmentLength = 4, separator = '__', termLength = 2 } = option;

        const segments = str.split(separator);
        const shortSegments = segments.reduce((acc: string[], val: string) => {
            const segmentTerms = val
                .replace(/([a-z\xE0-\xFF])([A-Z\xC0-\xDF])/g, '$1 $2')
                .split(' ');
            const length = segmentTerms.length > 1 ? termLength : segmentLength;
            const shortSegment = segmentTerms.map((term) => term.substr(0, length)).join('');

            acc.push(shortSegment);

            return acc;
        }, []);

        return shortSegments.join(separator);
    }

    /**
     * Hash 처리가 된 string을 리턴하도록 한다.
     *
     * @param {string} str
     * @param option
     * @returns {string}
     */
    static toHash(
        str: string,
        option: {
            length?: number;
        } = {},
    ): string {
        const hashFunction = shajs('sha1');

        hashFunction.update(str, 'utf8');

        const hashedInput = hashFunction.digest('hex');

        if (option.length) {
            return hashedInput.slice(0, option.length);
        }

        return hashedInput;
    }
}
