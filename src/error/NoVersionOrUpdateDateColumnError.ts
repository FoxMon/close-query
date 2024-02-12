import { CQError } from './CQError';

/**
 * `NoVersionOrUpdateDateColumnError.ts`
 */
export class NoVersionOrUpdateDateColumnError extends CQError {
    constructor(entity: string) {
        super(`Entity ${entity} does not have version or update date columns.`);
    }
}
