import { Naming } from './Naming';
import { StringUtil } from '../utils/StringUtil';

/**
 * `DefaultNaming.ts`
 *
 * Default로 Naming을 지정할 경우 해당 class에서 필요한 함수를
 * 사용 가능하도록 정의한다.
 */
export class DefaultNaming implements Naming {
    readonly '_instance' = Symbol.for('DefaultNaming');

    getColumnName(columnName: string, customName: string, prefixes: string[]): string {
        const name: string = customName || columnName;

        if (prefixes.length > 0) {
            return StringUtil.toCamelCase(prefixes.join('_')) + StringUtil.toTitleCase(name);
        }

        return name;
    }
}
