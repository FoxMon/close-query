/* eslint-disable @typescript-eslint/ban-types */

import { ConnectorBuilder } from '../../connector/ConnectorBuilder';
import { CQError } from '../../error/CQError';
import { Manager } from '../../manager/Manager';
import { CQDataStorage } from '../../storage/CQDataStorage';
import { RelationDataStorage } from '../../storage/RelationDataStorage';
import { ObjectUtil } from '../../utils/ObjectUtil';
import { QueryBuilderUtil } from '../../utils/QueryBuilderUtil';
import { AsSyntax } from '../AsSyntax';
import { QueryExpression } from '../QueryExpression';

/**
 * `JoinAttribute.ts`
 */
export class JoinAttribute {
    readonly _instance = Symbol.for('JoinAttribute');

    readonly manager: Manager;

    readonly queryExpression: QueryExpression;

    direction: 'LEFT' | 'INNER';

    alias: AsSyntax;

    entityOrProperty: Function | string;

    condition?: string;

    mapToProperty?: string;

    isMappingMany?: boolean;

    mapAsEntity?: Function | string;

    isSelectedCache: boolean;

    isSelectedEvaluated: boolean = false;

    relationCache: RelationDataStorage | undefined;

    relationEvaluated: boolean = false;

    constructor(manager: Manager, queryExpression: QueryExpression, joinAttribute?: JoinAttribute) {
        this.manager = manager;

        this.queryExpression = queryExpression;

        if (joinAttribute) {
            ObjectUtil.assign(this, joinAttribute);
        }
    }

    get isMany(): boolean {
        if (this.isMappingMany !== undefined) {
            return this.isMappingMany;
        }

        if (this.relation) {
            return this.relation.isManyToMany || this.relation.isOneToMany;
        }

        return false;
    }

    get isSelected(): boolean {
        if (!this.isSelectedEvaluated) {
            const getValue = () => {
                for (const select of this.queryExpression.selects) {
                    if (select.select === this.alias.name) {
                        return true;
                    }

                    if (
                        this.dataStorage &&
                        !!this.dataStorage.columns.find(
                            (column) =>
                                select.select === this.alias.name + '.' + column.propertyPath,
                        )
                    ) {
                        return true;
                    }
                }

                return false;
            };

            this.isSelectedCache = getValue();
            this.isSelectedEvaluated = true;
        }

        return this.isSelectedCache;
    }

    get tablePath(): string {
        return this.dataStorage ? this.dataStorage.tablePath : (this.entityOrProperty as string);
    }

    get parentAlias(): string | undefined {
        if (!QueryBuilderUtil.isAliasProperty(this.entityOrProperty)) {
            return undefined;
        }

        return this.entityOrProperty.substring(0, this.entityOrProperty.indexOf('.'));
    }

    get relationPropertyPath(): string | undefined {
        if (!QueryBuilderUtil.isAliasProperty(this.entityOrProperty)) {
            return undefined;
        }

        return this.entityOrProperty.substring(this.entityOrProperty.indexOf('.') + 1);
    }

    get relation(): RelationDataStorage | undefined {
        if (!this.relationEvaluated) {
            const getValue = () => {
                if (!QueryBuilderUtil.isAliasProperty(this.entityOrProperty)) {
                    return undefined;
                }

                const relationOwnerSelection = this.queryExpression.findAliasByName(
                    this.parentAlias!,
                );

                let relation = (
                    relationOwnerSelection.dataStorage as CQDataStorage
                ).findRelationWithPropertyPath(this.relationPropertyPath!);

                if (relation) {
                    return relation;
                }

                if (relationOwnerSelection.dataStorage?.parentCQDataStorage) {
                    relation =
                        relationOwnerSelection.dataStorage?.parentCQDataStorage.findRelationWithPropertyPath(
                            this.relationPropertyPath!,
                        );

                    if (relation) {
                        return relation;
                    }
                }

                throw new CQError(
                    `Relation with property path ${this.relationPropertyPath} in entity was not found.`,
                );
            };

            this.relationCache = getValue.bind(this)();
            this.relationEvaluated = true;
        }

        return this.relationCache;
    }

    get dataStorage(): CQDataStorage | undefined {
        if (this.relation) {
            return this.relation.inverseDataStorage;
        }

        if (this.manager.hasDataStoraget(this.entityOrProperty)) {
            return this.manager.getDataStorage(this.entityOrProperty);
        }

        if (this.mapAsEntity && this.manager.hasDataStoraget(this.mapAsEntity)) {
            return this.manager.getDataStorage(this.mapAsEntity);
        }

        return undefined;
    }

    get junctionAlias(): string {
        if (!this.relation) {
            throw new CQError(`Cannot get junction table for join without relation.`);
        }
        if (typeof this.entityOrProperty !== 'string') {
            throw new CQError(`Junction property is not defined.`);
        }

        const aliasProperty = this.entityOrProperty.substr(0, this.entityOrProperty.indexOf('.'));

        if (this.relation.isOwning) {
            return ConnectorBuilder.buildAlias(
                this.manager.connector,
                undefined,
                aliasProperty,
                this.alias.name,
            );
        } else {
            return ConnectorBuilder.buildAlias(
                this.manager.connector,
                undefined,
                this.alias.name,
                aliasProperty,
            );
        }
    }

    get mapToPropertyParentAlias(): string | undefined {
        if (!this.mapToProperty) {
            return undefined;
        }

        return this.mapToProperty!.split('.')[0];
    }

    get mapToPropertyPropertyName(): string | undefined {
        if (!this.mapToProperty) {
            return undefined;
        }

        return this.mapToProperty!.split('.')[1];
    }
}
