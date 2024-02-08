/* eslint-disable @typescript-eslint/no-explicit-any */

import { Connector } from '../../connector/Connector';
import { Manager } from '../../manager/Manager';
import { SelectQueryBuilder } from '../../query/builder/SelectQueryBuilder';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { TableIndex } from '../table/TableIndex';
import { ViewOption } from './ViewOption';

/**
 * `View.ts`
 *
 * Database에서 View를 표현하는 class를 정의하도록 한다.
 */
export class View {
    readonly _instance = Symbol.for('View');

    database?: string;

    schema?: string;

    name: string;

    materialized: boolean;

    indexes: TableIndex[];

    expression: string | ((manager: Manager) => SelectQueryBuilder<any>);

    constructor(option?: ViewOption) {
        this.indexes = [];

        if (option) {
            const { database, schema, name, expression, materialized } = option;

            this.database = database;

            this.schema = schema;

            this.name = name;

            this.expression = expression;

            this.materialized = materialized || false;
        }
    }

    create(): View {
        return new View(<ViewOption>{
            database: this.database,
            scheam: this.schema,
            name: this.name,
            expression: this.expression,
            materialized: this.materialized,
        });
    }

    static create(dataStorage: CQDataStorage, connector: Connector): View {
        const options: ViewOption = {
            database: dataStorage.database,
            schema: dataStorage.schema,
            name: connector.generateTableName(
                dataStorage.tableName,
                dataStorage.schema,
                dataStorage.database,
            ),
            expression: dataStorage.expression!,
            materialized: dataStorage.tables.materialized,
        };

        return new View(options);
    }

    addIndex(index: TableIndex) {
        this.indexes.push(index);
    }

    removeIndex(viweIndex: TableIndex) {
        const index = this.indexes.find((idx) => idx.name === viweIndex.name);

        if (index) {
            this.indexes.splice(this.indexes.indexOf(index), 1);
        }
    }
}
