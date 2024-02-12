/* eslint-disable @typescript-eslint/no-explicit-any */

import { ObjectIndexType } from '../types/ObjectIndexType';
import { ValueTransformer } from '../types/ValueTransformer';
import { CheckerUtil } from '../utils/CheckerUtil';
import { ObjectUtil } from '../utils/ObjectUtil';
import { FindOperatorType } from './FindOperatorType';

type SqlGeneratorType = (aliasPath: string) => string;

/**
 * `FindOperator.ts`
 */
export class FindOperator<T> {
    readonly _instance = Symbol.for('FindOperator');

    private _type: FindOperatorType;

    private _value: T | FindOperator<T>;

    private _objectLiteralParameters: ObjectIndexType | undefined;

    private _useParameter: boolean;

    private _multipleParameters: boolean;

    private _getSql: SqlGeneratorType | undefined;

    constructor(
        type: FindOperatorType,
        value: T | FindOperator<T>,
        useParameter: boolean = true,
        multipleParameters: boolean = false,
        getSql?: SqlGeneratorType,
        objectLiteralParameters?: ObjectIndexType,
    ) {
        this._type = type;
        this._value = value;
        this._useParameter = useParameter;
        this._multipleParameters = multipleParameters;
        this._getSql = getSql;
        this._objectLiteralParameters = objectLiteralParameters;
    }

    get useParameter(): boolean {
        if (CheckerUtil.checkIsFindOperator(this._value)) {
            return this._value.useParameter;
        }

        return this._useParameter;
    }

    get multipleParameters(): boolean {
        if (CheckerUtil.checkIsFindOperator(this._value)) {
            return this._value.multipleParameters;
        }

        return this._multipleParameters;
    }

    get type(): FindOperatorType {
        return this._type;
    }

    get value(): T {
        if (CheckerUtil.checkIsFindOperator(this._value)) {
            return this._value.value;
        }

        return this._value;
    }

    get objectLiteralParameters(): ObjectIndexType | undefined {
        if (CheckerUtil.checkIsFindOperator(this._value)) {
            return this._value.objectLiteralParameters;
        }

        return this._objectLiteralParameters;
    }

    get child(): FindOperator<T> | undefined {
        if (CheckerUtil.checkIsFindOperator(this._value)) {
            return this._value;
        }

        return undefined;
    }

    get getSql(): SqlGeneratorType | undefined {
        if (CheckerUtil.checkIsFindOperator(this._value)) {
            return this._value.getSql;
        }

        return this._getSql;
    }

    transformValue(transformer: ValueTransformer | ValueTransformer[]) {
        if (this._value instanceof FindOperator) {
            this._value.transformValue(transformer);
        } else {
            this._value =
                Array.isArray(this._value) && this._multipleParameters
                    ? this._value.map(
                          (v: any) => transformer && ObjectUtil.transformTo(transformer, v),
                      )
                    : ObjectUtil.transformTo(transformer, this._value);
        }
    }
}
