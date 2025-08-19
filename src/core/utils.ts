import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export const createTypeOrmRootModule = (options: TypeOrmModuleOptions) => TypeOrmModule.forRoot(options);

export const createTypeOrmFeatureModule = (entities: EntityClassOrSchema[]) => TypeOrmModule.forFeature(entities);
