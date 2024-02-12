/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * `TableColumnOption.ts`
 *
 * Table의 Column에 관련된 option을 정의하도록 한다.
 */
export interface TableCloumnOption {
    /**
     * Column에 대한 이름을 정의하도록 한다.
     */
    name: string;

    /**
     * Column에 대한 type을 정의하도록 한다.
     */
    type: string;

    /**
     * Column의 값이 지정될 때,
     * Default 값을 지정하도록 한다.
     */
    default?: any;

    /**
     * Null을 허용할 것인지 정의하도록 한다.
     *
     * Default: false
     */
    nullable?: boolean;

    /**
     * Table의 `Primary Key`가 될 것인지 결정하도록 한다.
     *
     * Default: false
     */
    primary?: boolean;

    /**
     * Column이 Unique한 값을 가질 것인지 지정하도록 한다.
     *
     * Default: false
     */
    unique?: boolean;

    /**
     * Column의 type에 대한 길이를 지정하도록 한다.
     * Length: `255` 라면 varchar(255)를 생성하도록 한다.
     *
     * Default: ""
     */
    length?: string;

    /**
     * Column type의 width를 나타내도록 한다.
     */
    width?: number;

    /**
     * Column의 collation을 지정하도록 한다.
     */
    collation?: string;

    /**
     * Precision
     */
    precision?: number | null;

    /**
     * Scale
     */
    scale?: number;

    /**
     * Generated column expression
     */
    asExpression?: string;

    /**
     * Generated column type
     */
    generatedType?: 'VIRTUAL' | 'STORED';

    /**
     * Zerofill attribute
     */
    zerofill?: boolean;

    /**
     * UNSIGNED attribute
     */
    unsigned?: boolean;

    /**
     * Enumerated values가 Array로 가능하도록 한다.
     */
    enum?: string[];

    /**
     * Enum의 이름
     */
    enumName?: string;

    /**
     * Auto-generated 인지 표현하는 필드이다.
     */
    isGenerated?: boolean;

    /**
     * Column이 array를 지원할 것인지 나타내도록 한다.
     */
    isArray?: boolean;

    /**
     * Charset
     */
    charset?: string;

    /**
     * Auto-generated가 됐을 때 어떠한 전략으로
     * 나타낼 것인지 표현하도록 한다.
     */
    generationStrategy?: 'uuid' | 'increment' | 'rowid' | 'identity';

    /**
     * ON UPDATE TRIGGER
     */
    onUpdate?: string;

    /**
     * Column의 comment를 나타낸다.
     */
    comment?: string;
}
