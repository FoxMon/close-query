import { ManagerOptions } from './ManagerOptions';

/**
 * `Manager.ts`
 *
 * Manager는 Database에 연결하기 전 미리 Database의 설정과 같은 것들을 정의할 때
 * 사용되는 class 이다.
 */
export class Manager {
    readonly options: ManagerOptions;

    /**
     * Manager가 초기화가 됐는지에 대한 Flag.
     * 초기화가 진행됐다면 `true`, 아니라면 `false`.
     */
    readonly isInitialized: boolean;

    constructor(options: ManagerOptions) {
        this.options = options;

        this.isInitialized = false;
    }

    setOptions(options: Partial<ManagerOptions>) {
        Object.assign(this.options, options);

        return this;
    }
}
