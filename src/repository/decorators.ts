import { Inject } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

/**
 * Inject an extended repository with findOneOrCreate/findOneOrUpdate methods
 * Usage: @InjectExtendedRepository(User) private userRepo: ExtendedRepository<User>
 */
export const InjectExtendedRepository = (entity: EntityClassOrSchema): ParameterDecorator =>
    Inject(getRepositoryToken(entity));
