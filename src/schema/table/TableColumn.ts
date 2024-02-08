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

    asExpression?: string;

    generatedType?: 'VIRTUAL' | 'STORED';

    zerofill: boolean = false;

    unsigned: boolean = false;

    enum?: string[];

    enumName?: string;

    isGenerated: boolean = false;

    isArray: boolean = false;

    width?: number;

    charset?: string;

    collation?: string;

    precision?: number | null;

    scale?: number;

    generationStrategy?: 'uuid' | 'increment' | 'rowid' | 'identity';

    comment?: string;

    onUpdate?: string;

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
            this.asExpression = options.asExpression;
            this.generatedType = options.generatedType;
            this.zerofill = options.zerofill || false;
            this.unsigned = this.zerofill ? true : options.unsigned || false;
            this.enum = options.enum;
            this.enumName = options.enumName;
            this.isGenerated = options.isGenerated || false;
            this.isArray = options.isArray || false;
            this.charset = options.charset;
            this.generationStrategy = options.generationStrategy;
            this.comment = options.comment;
            this.onUpdate = options.onUpdate;
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
            asExpression: this.asExpression,
            zerofill: this.zerofill,
            unsigned: this.unsigned,
            enum: this.enum,
            enumName: this.enumName,
            isGenerated: this.isGenerated,
            isArray: this.isArray,
            charset: this.charset,
            generationStrategy: this.generationStrategy,
            comment: this.comment,
            onUpdate: this.onUpdate,
        });
    }
}
