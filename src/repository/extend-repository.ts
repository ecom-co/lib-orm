import type { Provider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DataSource, Repository } from 'typeorm';
import type { DeepPartial, EntityTarget, FindOneOptions, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * Enhanced Repository with additional convenience methods
 */
export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    async findOneAndUpdate(
        where: FindOptionsWhere<Entity>,
        data: QueryDeepPartialEntity<Entity>,
        options: { upsert?: boolean } = {},
    ): Promise<Entity | null> {
        const findOptions: FindOneOptions<Entity> = { where } as FindOneOptions<Entity>;
        const existing = await this.findOne(findOptions);
        if (!existing) {
            if (!options.upsert) return null;
            const created = this.create(data as unknown as DeepPartial<Entity>);
            const saved = await this.save(created as DeepPartial<Entity>);
            return saved as Entity;
        }
        const merged = this.merge(existing, data as unknown as DeepPartial<Entity>);
        const saved = await this.save(merged as DeepPartial<Entity>);
        return saved as Entity;
    }

    async findOneOrCreate(
        where: FindOptionsWhere<Entity>,
        defaults: QueryDeepPartialEntity<Entity> = {},
    ): Promise<Entity> {
        const findOptions: FindOneOptions<Entity> = { where } as FindOneOptions<Entity>;
        const existing = await this.findOne(findOptions);
        if (existing) return existing;

        const created = this.create({ ...where, ...defaults } as unknown as DeepPartial<Entity>);
        const saved = await this.save(created as DeepPartial<Entity>);
        return saved as Entity;
    }
}

/**
 * Create providers that override default repository tokens with BaseRepository
 */
export const createBaseRepositoryProviders = (entities: EntityClassOrSchema[]): Provider[] =>
    entities.map((entity) => ({
        provide: getRepositoryToken(entity),
        inject: [DataSource],
        useFactory: (dataSource: DataSource) => {
            const repo = dataSource.getRepository(entity as EntityTarget<any>);
            // Mix BaseRepository methods into the standard repository
            Object.setPrototypeOf(repo, BaseRepository.prototype);
            return repo;
        },
    }));
