import { DialectPlatform } from '../dialect/DialectPlatform';
import { SchemaDataStorage } from './SchemaDataStorage';

/**
 * `static.ts`
 *
 * 전역으로 관리하는 DataStorage 데이터를 만든다.
 */

export function getStaticStorage(): SchemaDataStorage {
    const global = DialectPlatform.getGlobal();

    if (!global.closeQueryDataStorage) {
        global.closeQueryDataStorage = new SchemaDataStorage();
    }

    return global.closeQueryDataStorage;
}
