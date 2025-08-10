import type { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

/**
 * Create strongly-typed extensions for a specific repository.
 * Use with `extendRepository(dataSource, Entity, makeRepositoryExtensions<TEntity>())`.
 */
export const makeRepositoryExtensions = <TEntity extends object>() => ({
    async findOneOrCreate(
        this: Repository<TEntity>,
        where: FindOptionsWhere<TEntity>,
        createData: DeepPartial<TEntity>,
    ): Promise<TEntity> {
        const existing = await this.findOne({ where });
        if (existing) return existing;
        const entity = this.create(createData);
        return this.save(entity);
    },

    async findOneOrUpdate(
        this: Repository<TEntity>,
        where: FindOptionsWhere<TEntity>,
        patch: DeepPartial<TEntity>,
    ): Promise<TEntity> {
        const entity = await this.findOne({ where });
        if (!entity) {
            throw new Error('Entity not found');
        }
        const merged = this.merge(entity, patch);
        return this.save(merged);
    },
});

/**
 * Create generic extensions usable in provider factories without generics.
 * Use with `createExtendedRepositoryProviders(entities, makeDefaultRepositoryExtensions)`.
 */
export const makeDefaultRepositoryExtensions = () => makeRepositoryExtensions<any>();

/**
 * Type for extended repository with custom methods
 */
export type ExtendedRepository<T extends object> = import('typeorm').Repository<T> &
    ReturnType<typeof makeRepositoryExtensions<T>>;
