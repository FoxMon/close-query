/* eslint-disable @typescript-eslint/ban-types */

import { ObjectIndexType } from '../types/ObjectIndexType';
import { CQDataStorage } from './CQDataStorage';
import { DataStorageListenerOption } from './DataStorageListenerOption';
import { EmbeddedDataStorage } from './EmbeddedDataStorage';
import { DataStorageListenerType } from './types/DataStorageListenerType';

/**
 * `DataStorageListener.ts`
 */
export class DataStorageListener {
    dataStorage: CQDataStorage;

    embeddedDataStorage?: EmbeddedDataStorage;

    target: Function | string;

    propertyName: string;

    /**
     * The type of the listener.
     */
    type: DataStorageListenerType;

    constructor(options: {
        dataStorage: CQDataStorage;
        embeddedDataStorage?: EmbeddedDataStorage;
        args: DataStorageListenerOption;
    }) {
        this.dataStorage = options.dataStorage;
        this.embeddedDataStorage = options.embeddedDataStorage;
        this.target = options.args.target;
        this.propertyName = options.args.propertyName;
        this.type = options.args.type;
    }

    isAllowed(entity: ObjectIndexType) {
        return (
            this.dataStorage.target === entity.constructor ||
            (typeof this.dataStorage.target === 'function' &&
                entity.constructor.prototype instanceof this.dataStorage.target)
        );
    }

    execute(entity: ObjectIndexType) {
        if (!this.embeddedDataStorage) {
            return entity[this.propertyName]();
        }

        this.callEntityEmbeddedMethod(entity, this.embeddedDataStorage.propertyPath.split('.'));
    }

    protected callEntityEmbeddedMethod(entity: ObjectIndexType, propertyPaths: string[]): void {
        const propertyPath = propertyPaths.shift();

        if (!propertyPath || !entity[propertyPath]) {
            return;
        }

        if (propertyPaths.length === 0) {
            if (Array.isArray(entity[propertyPath])) {
                entity[propertyPath].map((embedded: ObjectIndexType) =>
                    embedded[this.propertyName](),
                );
            } else {
                entity[propertyPath][this.propertyName]();
            }
        } else {
            if (entity[propertyPath])
                this.callEntityEmbeddedMethod(entity[propertyPath], propertyPaths);
        }
    }
}
