import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const createTypeOrmRootModule = (options: TypeOrmModuleOptions) => TypeOrmModule.forRoot(options);

export const createTypeOrmFeatureModule = (entities: (new (...args: any[]) => any)[]) =>
    TypeOrmModule.forFeature(entities);
