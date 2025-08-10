import 'reflect-metadata';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
// Local minimal type compatible with @nestjs/terminus HealthIndicatorResult
export type HealthIndicatorResult = Record<string, { status: 'up' | 'down'; latencyMs: number; [k: string]: unknown }>;
import { TypeOrmModule, TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DataSource } from 'typeorm';

import { createExtendedRepositoryProviders } from './repository/extend-repository';
import { makeDefaultRepositoryExtensions } from './repository/extensions';

export type OrmModuleOptions = TypeOrmModuleOptions & {
    health?: boolean;
    extendRepositories?:
        | boolean
        | {
              entities?: EntityClassOrSchema[];
              makeExtension?: <_T>() => object;
          };
};

export type OrmModuleAsyncOptions = TypeOrmModuleAsyncOptions & {
    health?: boolean;
    extendRepositories?:
        | boolean
        | {
              entities: EntityClassOrSchema[]; // required in async mode unless boolean false
              makeExtension?: <_T>() => object;
          };
};

export const ORM_HEALTH_KEY = 'db';
export const ORM_HEALTH_CHECK = Symbol('ORM_HEALTH_CHECK');
export type OrmHealthCheckFn = (key?: string) => Promise<HealthIndicatorResult>;

export const checkTypeOrmHealthy = async (
    dataSource: DataSource,
    key: string = ORM_HEALTH_KEY,
): Promise<HealthIndicatorResult> => {
    const startedAt = Date.now();
    await dataSource.query('SELECT 1');
    const durationMs = Date.now() - startedAt;
    return {
        [key]: { status: 'up', latencyMs: durationMs },
    } as const;
};

@Global()
@Module({})
export class OrmModule {
    static forRoot = (options: OrmModuleOptions): DynamicModule => {
        const { health, extendRepositories, ...typeormOptions } = options;

        const healthProvider: Provider | undefined = health
            ? {
                  provide: ORM_HEALTH_CHECK,
                  useFactory:
                      (ds: DataSource) =>
                      (key: string = ORM_HEALTH_KEY): Promise<HealthIndicatorResult> =>
                          checkTypeOrmHealthy(ds, key),
                  inject: [DataSource],
              }
            : undefined;

        // Auto-extend repositories if requested (only works when entities are known here)
        const extProviders: Provider[] = (() => {
            if (!extendRepositories) return [];
            const cfg = typeof extendRepositories === 'boolean' ? {} : extendRepositories;
            const entities = cfg.entities ?? (typeormOptions as { entities?: EntityClassOrSchema[] }).entities ?? [];
            if (!entities || entities.length === 0) return [];
            const makeExt = cfg.makeExtension ?? makeDefaultRepositoryExtensions;
            return createExtendedRepositoryProviders(entities, makeExt);
        })();

        return {
            module: OrmModule,
            imports: [TypeOrmModule.forRoot(typeormOptions)],
            providers: [...(healthProvider ? [healthProvider] : []), ...extProviders],
            exports: [
                ...(healthProvider ? [healthProvider] : []),
                ...extProviders.map((p) => (p as { provide: string }).provide),
            ],
        };
    };

    static forRootAsync = (options: OrmModuleAsyncOptions): DynamicModule => {
        const { health, extendRepositories, ...typeormAsyncOptions } = options;

        const healthProvider: Provider | undefined = health
            ? {
                  provide: ORM_HEALTH_CHECK,
                  useFactory:
                      (ds: DataSource) =>
                      (key: string = ORM_HEALTH_KEY): Promise<HealthIndicatorResult> =>
                          checkTypeOrmHealthy(ds, key),
                  inject: [DataSource],
              }
            : undefined;

        // In async mode, we cannot reliably read entities from the TypeOrm factory result here,
        // so require entities to be provided explicitly when enabling extensions.
        const extProviders: Provider[] = (() => {
            if (!extendRepositories) return [];
            if (extendRepositories === true) return [];
            const { entities, makeExtension } = extendRepositories;
            if (!entities || entities.length === 0) return [];
            const makeExt = makeExtension ?? makeDefaultRepositoryExtensions;
            return createExtendedRepositoryProviders(entities, makeExt);
        })();

        return {
            module: OrmModule,
            imports: [TypeOrmModule.forRootAsync(typeormAsyncOptions)],
            providers: [...(healthProvider ? [healthProvider] : []), ...extProviders],
            exports: [
                ...(healthProvider ? [healthProvider] : []),
                ...extProviders.map((p) => (p as { provide: string }).provide),
            ],
        };
    };
}
