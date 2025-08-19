export * from './product.entity';

export * from './user.entity';

import { Product } from './product.entity';
import { User } from './user.entity';

import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

// Core entity list for easy registration in modules/datasource
export const CORE_ENTITIES: EntityClassOrSchema[] = [User, Product];
