import { DefaultDataTypes } from '../types/DefaultDataTypes';

/**
 * `Connector.ts`
 *
 * Database에 Connect할 대상의 공통 interface
 */
export interface Connector {
    /**
     * 기본적인 precision, scale, length와 같은 default values에 해당하는 type.
     */
    defaultDataTypes: DefaultDataTypes;

    /**
     * Database와 Connect을 수행하도록 한다.
     * 대상 Database가 무엇인지에 따라서 약간의 차이가 존재할 수도 있다.
     */
    connect(): Promise<void>;

    /**
     * Database와의 접속을 끊는 작업을 수행하도록 한다.
     */
    disconnect(): Promise<void>;
}