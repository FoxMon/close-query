/* eslint-disable @typescript-eslint/no-explicit-any */

import { TableCloumnOption } from '../option/TableColumnOption';

/**
 * `TableColumn.ts`
 *
 * Table에 대한 Column 관련 로직을 정의한 class 이다.
 */
export class TableColumn {
    readonly '_instance' = Symbol.for('TableColumn');

    name: string;

    type: string;

    default?: any;

    nullable?: boolean = false;

    primary?: boolean = false;

    unique?: boolean = false;

    length?: string = '';

    width?: number;

    collation?: string;

    precision?: number | null;

    scale?: number;

    constructor(options?: TableCloumnOption) {
        if (options) {
            this.name = options.name;

            this.type = options.type;

            this.default = options.default;

            this.nullable = options.nullable || false;

            this.primary = options.primary || false;

            this.unique = options.unique || false;

            this.length = options.length || '';

            this.width = options.width;

            this.collation = options.collation;

            this.precision = options.precision;

            this.scale = options.scale;
        }
    }

    createTableColumn(): TableColumn {
        return new TableColumn({
            name: this.name,
            type: this.type,
            default: this.default,
            nullable: this.nullable,
            primary: this.primary,
            unique: this.unique,
            length: this.length,
            width: this.width,
            collation: this.collation,
            precision: this.precision,
            scale: this.scale,
        });
    }
}
