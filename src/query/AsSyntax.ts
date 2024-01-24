import { CQError } from '../error/CQError';
import { CQDataStorage } from '../storage/CQDataStorage';
import { ObjectUtil } from '../utils/ObjectUtil';

/**
 * `AsSyntax.ts`
 *
 * Alias를 위한 Syntax를 관리하기 위해 Class를 정의하도록 한다.
 */
export class AsSyntax {
    readonly '_instance' = Symbol.for('AsSyntax');

    type: 'select' | 'from' | 'join' | 'other';

    name: string;

    subQuery?: string;

    table?: string;

    dataStorage?: CQDataStorage;

    constructor(alias?: AsSyntax) {
        ObjectUtil.assign(this, alias || {});
    }

    getTarget() {
        if (this.dataStorage) {
            return this.dataStorage.target;
        }

        return null;
    }

    getDataStorage() {
        if (this.dataStorage) {
            return this.dataStorage;
        }

        return null;
    }

    setDataStorage(dataStorage: CQDataStorage) {
        this.dataStorage = dataStorage;
    }

    hasDataStorage() {
        if (!this.dataStorage) {
            throw new CQError(`Cannot get metadata for the given alias "${this.name}"`);
        }

        return true;
    }
}
