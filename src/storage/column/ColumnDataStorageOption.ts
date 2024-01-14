/* eslint-disable @typescript-eslint/ban-types */

import { ColumnOption } from '../../decorators/option/ColumnOption';
import { ColumnMode } from './ColumnMode';

/**
 * `ColumnDataStorageOption.ts`
 *
 * Column에 해당하는 Data들을 저장할 수 있는 Storage의
 * option들을 정의한다.
 */
export interface ColumnDataStorageOption {
    /**
     * Column이 지정될 target에 대한 필드를 정의한다.
     * Class 안의 property에 적용된다.
     */
    readonly target: Function | string;

    /**
     * Decorator가 붙은 property의 이름을 가져오도록 한다.
     */
    readonly propertyName: string;

    /**
     * Column mode.
     */
    readonly mode: ColumnMode;

    /**
     * Column의 옵션을 지정한다.
     */
    readonly options: ColumnOption;
}
