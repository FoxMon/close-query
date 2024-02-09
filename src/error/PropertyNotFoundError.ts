import { CQDataStorage } from '../storage/CQDataStorage';
import { CQError } from './CQError';

/**
 * `PropertyNotFoundError.ts`
 */
export class PropertyNotFoundError extends CQError {
    constructor(propertyPath: string, metadata: CQDataStorage) {
        super(propertyPath);

        Object.setPrototypeOf(this, PropertyNotFoundError.prototype);

        this.message = `Property "${propertyPath}" was not found in "${metadata.targetName}". Make sure your query is correct.`;
    }
}
