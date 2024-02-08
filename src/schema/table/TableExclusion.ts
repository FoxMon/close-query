import { ExclusionDataStorageOption } from '../../storage/ExclusionDataStorageOption';
import { TableExclusionOption } from './TableExclusionOption';

export class TableExclusion {
    readonly _instance = Symbol.for('TableExclusion');

    name?: string;

    expression?: string;

    constructor(option: TableExclusionOption) {
        this.name = option.name;
        this.expression = option.expression;
    }

    create(): TableExclusion {
        return new TableExclusion(<TableExclusionOption>{
            name: this.name,
            expression: this.expression,
        });
    }

    static create(exclusionMetadata: ExclusionDataStorageOption): TableExclusion {
        return new TableExclusion(<TableExclusionOption>{
            name: exclusionMetadata.name,
            expression: exclusionMetadata.expression,
        });
    }
}
