import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export const createTypeOrmRootModule = (options: TypeOrmModuleOptions) => TypeOrmModule.forRoot(options);

export const createTypeOrmFeatureModule = (entities: EntityClassOrSchema[]) => TypeOrmModule.forFeature(entities);
