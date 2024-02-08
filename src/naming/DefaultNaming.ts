import { Naming } from './Naming';
import { StringUtil } from '../utils/StringUtil';
import { RandomUtil } from '../utils/RandomUtil';
import { Table } from '../schema/table/Table';

/**
 * `DefaultNaming.ts`
 *
 * Default로 Naming을 지정할 경우 해당 class에서 필요한 함수를
 * 사용 가능하도록 정의한다.
 */
export class DefaultNaming implements Naming {
    readonly '_instance' = Symbol.for('DefaultNaming');

    getTableName(tableOrName: Table | string): string {
        if (typeof tableOrName !== 'string') {
            tableOrName = tableOrName.name;
        }

        return tableOrName.split('.').pop()!;
    }

    getColumnName(columnName: string, customName: string, prefixes: string[]): string {
        const name: string = customName || columnName;

        if (prefixes.length > 0) {
            return StringUtil.toCamelCase(prefixes.join('_')) + StringUtil.toTitleCase(name);
        }

        return name;
    }

    checkConstraintName(tableOrName: Table | string, expression: string, isEnum?: boolean): string {
        const tableName = this.getTableName(tableOrName);
        const replacedTableName = tableName.replace('.', '_');
        const key = `${replacedTableName}_${expression}`;
        const name = 'CHK_' + RandomUtil.sha1(key).substr(0, 26);

        return isEnum ? `${name}_ENUM` : name;
    }

    exclusionConstraintName(tableOrName: Table | string, expression: string): string {
        const tableName = this.getTableName(tableOrName);
        const replacedTableName = tableName.replace('.', '_');
        const key = `${replacedTableName}_${expression}`;

        return 'XCL_' + RandomUtil.sha1(key).substr(0, 26);
    }
}
