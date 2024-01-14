/**
 * `ColumnMode.ts`
 *
 * Column들의 종류에 대한 type을 지정하도록 한다.
 */
export type ColumnMode =
    | 'regular'
    | 'virtual'
    | 'virtual-property'
    | 'createDate'
    | 'updateDate'
    | 'deleteDate'
    | 'version'
    | 'treeChildrenCount'
    | 'treeLevel'
    | 'objectId'
    | 'array';
