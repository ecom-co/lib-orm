import type { Provider } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DataSource } from 'typeorm';
import type { EntityTarget, Repository } from 'typeorm';

/**
 * Extend a TypeORM repository with custom methods, preserving typings
 */
export const extendRepository = <TEntity extends object, TExt extends object>(
    dataSource: DataSource,
    entity: EntityTarget<TEntity>,
    extension: TExt,
): Repository<TEntity> & TExt => dataSource.getRepository<TEntity>(entity).extend(extension);

/**
 * Create Nest providers that override default repository tokens with extended repositories
 * @template T - The type of the extension to add to the repository
 */
export const createExtendedRepositoryProviders = (
    entities: EntityClassOrSchema[],
    makeExtension: <_T>() => object,
): Provider[] =>
    entities.map((entity) => ({
        provide: getRepositoryToken(entity),
        inject: [DataSource],
        // Nest injects DataSource provided by TypeOrmModule
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(entity as EntityTarget<any>).extend(makeExtension()),
    }));

// Re-export factory for default extensions to import from this module for convenience
export { makeDefaultRepositoryExtensions } from './extensions';
