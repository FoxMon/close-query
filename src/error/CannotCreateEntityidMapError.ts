/* eslint-disable @typescript-eslint/no-explicit-any */

import { CQError } from './CQError';
import { CQDataStorage } from '../storage/CQDataStorage';
import { ObjectIndexType } from '../types/ObjectIndexType';

/**
 * `CannotCreateEntityIdMapError.ts`
 */
export class CannotCreateEntityIdMapError extends CQError {
    constructor(dataStorage: CQDataStorage, id: any) {
        super();

        const objectExample = dataStorage.primaryColumns.reduce((object, column, index) => {
            column.setEntityValue(object, index + 1);

            return object;
        }, {} as ObjectIndexType);

        this.message = `Cannot use given entity id "${id}" because "${
            dataStorage.targetName
        }" contains multiple primary columns, you must provide object in following form: ${JSON.stringify(
            objectExample,
        )} as an id.`;
    }
}
