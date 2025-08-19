import 'reflect-metadata';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

// Local minimal type compatible with @nestjs/terminus HealthIndicatorResult
export type HealthIndicatorResult = Record<string, { [k: string]: unknown; latencyMs: number; status: 'down' | 'up' }>;
import {
    TypeOrmModule as NestTypeOrmModule,
    TypeOrmModule,
    TypeOrmModuleAsyncOptions,
    TypeOrmModuleOptions,
} from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { createBaseRepositoryProviders } from './repository/extend-repository';

export type OrmModuleAsyncOptions = TypeOrmModuleAsyncOptions & {
    health?: boolean;
};

export type OrmModuleOptions = TypeOrmModuleOptions & {
    health?: boolean;
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
        const { health, ...typeormOptions } = options;

        const healthProvider: Provider | undefined = health
            ? {
                  inject: [DataSource],
                  provide: ORM_HEALTH_CHECK,
                  useFactory:
                      (ds: DataSource) =>
                      (key: string = ORM_HEALTH_KEY): Promise<HealthIndicatorResult> =>
                          checkTypeOrmHealthy(ds, key),
              }
            : undefined;

        return {
            imports: [TypeOrmModule.forRoot(typeormOptions)],
            providers: [...(healthProvider ? [healthProvider] : [])],
            exports: [...(healthProvider ? [healthProvider] : [])],
            module: OrmModule,
        };
    };

    static forRootAsync = (options: OrmModuleAsyncOptions): DynamicModule => {
        const { health, ...typeormAsyncOptions } = options;

        const healthProvider: Provider | undefined = health
            ? {
                  inject: [DataSource],
                  provide: ORM_HEALTH_CHECK,
                  useFactory:
                      (ds: DataSource) =>
                      (key: string = ORM_HEALTH_KEY): Promise<HealthIndicatorResult> =>
                          checkTypeOrmHealthy(ds, key),
              }
            : undefined;

        return {
            imports: [TypeOrmModule.forRootAsync(typeormAsyncOptions)],
            providers: [...(healthProvider ? [healthProvider] : [])],
            exports: [...(healthProvider ? [healthProvider] : [])],
            module: OrmModule,
        };
    };

    // Convenience wrappers to avoid importing Nest TypeOrmModule directly in consumers
    static forFeature = (entities: EntityClassOrSchema[], dataSource?: string): DynamicModule => ({
        imports: [NestTypeOrmModule.forFeature(entities, dataSource)],
        exports: [NestTypeOrmModule],
        module: OrmModule,
    });

    static forFeatureExtended = (entities: EntityClassOrSchema[], dataSource?: string): DynamicModule => ({
        imports: [NestTypeOrmModule.forFeature(entities, dataSource)],
        providers: createBaseRepositoryProviders(entities),
        exports: [NestTypeOrmModule],
        module: OrmModule,
    });
}
