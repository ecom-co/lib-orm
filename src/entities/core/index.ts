export * from './user.entity';
export * from './product.entity';

import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { Product } from './product.entity';
import { User } from './user.entity';

// Core entity list for easy registration in modules/datasource
export const CORE_ENTITIES: EntityClassOrSchema[] = [User, Product];
