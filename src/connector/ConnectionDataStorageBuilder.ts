/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { Manager } from '../manager/Manager';

/**
 * `ConnectionDataStorageBuilder.ts`
 *
 * DataStorage의 Data를 관리하기 위한 Class를 정의한다.
 */
export class ConnectionDataStorageBuilder {
    readonly manager: Manager;

    constructor(manager: Manager) {
        this.manager = manager;
    }
}
