import { ColumnType } from '../../types/column/ColumType';

/**
 * `MappedColumnTypes.ts`
 *
 * ORM에서 특별한 Column의 Type이 사용되는 경우 Mapping해주기 위한 필드이다.
 */
export interface MappedColumnTypes {
    createDate: ColumnType;

    createDatePrecision?: number;

    createDateDefault: string;

    updateDate: ColumnType;

    updateDatePrecision?: number;

    updateDateDefault: string;

    deleteDate: ColumnType;

    deleteDatePrecision?: number;

    deleteDateNullable: boolean;

    version: ColumnType;

    treeLevel: ColumnType;

    migrationId: ColumnType;

    migrationTimestamp: ColumnType;

    migrationName: ColumnType;

    cacheId: ColumnType;

    cacheIdentifier: ColumnType;

    cacheTime: ColumnType;

    cacheDuration: ColumnType;

    cacheQuery: ColumnType;

    cacheResult: ColumnType;

    metadataType: ColumnType;

    metadataDatabase: ColumnType;

    metadataSchema: ColumnType;

    metadataTable: ColumnType;

    metadataName: ColumnType;

    metadataValue: ColumnType;
}
