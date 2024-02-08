import { CQError } from './CQError';

/**
 * `InsertValuesMissingError.ts`
 */
export class InsertValuesMissingError extends CQError {
    constructor() {
        super(
            `Cannot perform insert query because values are not defined. ` +
                `Call "qb.values(...)" method to specify inserted values.`,
        );
    }
}
