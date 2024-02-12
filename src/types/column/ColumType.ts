/**
 * `ColumnType.ts`
 *
 * Column의 Type이 될 수 있는 것들을 명시하도록 한다.
 */

export type PrimaryGeneratedColumnType =
    | 'int'
    | 'int2'
    | 'int4'
    | 'int8'
    | 'integer'
    | 'tinyint'
    | 'smallint'
    | 'mediumint'
    | 'bigint'
    | 'dec'
    | 'decimal'
    | 'fixed'
    | 'numeric';

export type BaseColumnType =
    // MySQL
    | 'float'
    | 'boolean'
    | 'bool'
    | 'mediumblob'
    | 'mediumtext'
    | 'blob'
    | 'text'
    | 'longblob'
    | 'longtext'
    | 'date'
    | 'year'
    | 'point'
    | 'geometry'
    | 'linestring'
    | 'multipoint'
    | 'multilinestring'
    | 'multipolygon'
    | 'geometrycollection'
    | 'enum'
    | 'simple-enum'
    | 'set'
    | 'uuid'
    | 'json';

export type SpecialBaseColumnType =
    // MySQL
    'tinyint' | 'smallint' | 'mediumint' | 'int' | 'bigint';

export type LengthColumnType =
    // MySQL
    'nvarchar' | 'character' | 'varchar' | 'nchar' | 'national char';

export type PrecisionColumnType =
    // MySQL
    | 'float'
    | 'double'
    | 'double precesion'
    | 'dec'
    | 'decimal'
    | 'fixed'
    | 'real'
    | 'datetime'
    | 'time'
    | 'timestamp';

export type ColumnType =
    | PrimaryGeneratedColumnType
    | BaseColumnType
    | SpecialBaseColumnType
    | LengthColumnType
    | PrecisionColumnType
    | NumberConstructor
    | StringConstructor
    | BooleanConstructor
    | DateConstructor;
