import 'reflect-metadata';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
// Local minimal type compatible with @nestjs/terminus HealthIndicatorResult
export type HealthIndicatorResult = Record<string, { status: 'up' | 'down'; latencyMs: number; [k: string]: unknown }>;
import {
    TypeOrmModule,
    TypeOrmModuleAsyncOptions,
    TypeOrmModuleOptions,
    TypeOrmModule as NestTypeOrmModule,
} from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { DataSource } from 'typeorm';

import { createBaseRepositoryProviders } from './repository/extend-repository';

export type OrmModuleOptions = TypeOrmModuleOptions & {
    health?: boolean;
};

export type OrmModuleAsyncOptions = TypeOrmModuleAsyncOptions & {
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
                  provide: ORM_HEALTH_CHECK,
                  useFactory:
                      (ds: DataSource) =>
                      (key: string = ORM_HEALTH_KEY): Promise<HealthIndicatorResult> =>
                          checkTypeOrmHealthy(ds, key),
                  inject: [DataSource],
              }
            : undefined;

        return {
            module: OrmModule,
            imports: [TypeOrmModule.forRoot(typeormOptions)],
            providers: [...(healthProvider ? [healthProvider] : [])],
            exports: [...(healthProvider ? [healthProvider] : [])],
        };
    };

    static forRootAsync = (options: OrmModuleAsyncOptions): DynamicModule => {
        const { health, ...typeormAsyncOptions } = options;

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

        return {
            module: OrmModule,
            imports: [TypeOrmModule.forRootAsync(typeormAsyncOptions)],
            providers: [...(healthProvider ? [healthProvider] : [])],
            exports: [...(healthProvider ? [healthProvider] : [])],
        };
    };

    // Convenience wrappers to avoid importing Nest TypeOrmModule directly in consumers
    static forFeature = (entities: EntityClassOrSchema[], dataSource?: string): DynamicModule => ({
        module: OrmModule,
        imports: [NestTypeOrmModule.forFeature(entities, dataSource)],
        exports: [NestTypeOrmModule],
    });

    static forFeatureExtended = (entities: EntityClassOrSchema[], dataSource?: string): DynamicModule => ({
        module: OrmModule,
        imports: [NestTypeOrmModule.forFeature(entities, dataSource)],
        providers: createBaseRepositoryProviders(entities),
        exports: [NestTypeOrmModule],
    });
}
