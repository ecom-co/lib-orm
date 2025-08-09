import type { DataSource, EntityTarget, Repository } from 'typeorm';

/**
 * Extend a TypeORM repository with custom methods, preserving typings
 */
export const extendRepository = <TEntity extends object, TExt extends object>(
    dataSource: DataSource,
    entity: EntityTarget<TEntity>,
    extension: TExt,
): Repository<TEntity> & TExt => dataSource.getRepository<TEntity>(entity).extend(extension);
