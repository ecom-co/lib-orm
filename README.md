# @ecom-co/orm

Shared TypeORM layer for e-commerce projects: entities, transformers, Nest helpers, DataSource utilities, and an extended Repository.

- OrmModule: drop-in wrapper around Nest `TypeOrmModule` with optional health check
- `BaseRepository<T>`: extends TypeORM `Repository<T>` with extra helpers
- Standalone DataSource helpers (connect/disconnect/cache)
- Core entities and transformers

## Installation

```bash
npm install @ecom-co/orm
```

Enable decorators in your tsconfig:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Import reflect-metadata once at app startup:

```ts
import 'reflect-metadata';
```

## Usage

### NestJS (root-only imports)

We expose everything from the root entry. Avoid subpath imports.

#### OrmModule (drop-in wrapper + health)

```ts
import { Module } from '@nestjs/common';
import { OrmModule, CORE_ENTITIES, checkTypeOrmHealthy } from '@ecom-co/orm';

@Module({
  imports: [
    OrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
      entities: CORE_ENTITIES,
      health: true,
    }),
  ],
})
export class AppModule {}
```

Async version:

```ts
OrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    url: config.get('DATABASE_URL'),
    entities: CORE_ENTITIES,
    health: true,
  }),
});
```

Health check usage (built-in):

```ts
// If you provided health: true, you can also inject 'ORM_HEALTH_CHECK' provider for a bound checker.
import { Inject } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { checkTypeOrmHealthy } from '@ecom-co/orm';

export class HealthService {
  constructor(@Inject(DataSource) private readonly ds: DataSource) {}

  async db() {
    return checkTypeOrmHealthy(this.ds);
  }
}
```

Or inject the bound provider when `health: true` is set:

```ts
import { Inject } from '@nestjs/common';

import { ORM_HEALTH_CHECK, OrmHealthCheckFn } from '@ecom-co/orm';

export class HealthService {
  constructor(@Inject(ORM_HEALTH_CHECK) private readonly ormHealth: OrmHealthCheckFn) {}

  db() {
    return this.ormHealth('database');
  }
}
```

Integrate with `@nestjs/terminus` (optional):

```ts
import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';

import { ORM_HEALTH_CHECK, OrmHealthCheckFn } from '@ecom-co/orm';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(ORM_HEALTH_CHECK) private readonly ormHealth: OrmHealthCheckFn,
  ) {}

  @Get('db')
  @HealthCheck()
  check() {
    return this.health.check([() => this.ormHealth('db')]);
  }
}
```

Typing with Terminus (optional):

```ts
// If your app uses @nestjs/terminus, you can type the return shape via a type-only import.
// Note: This import is type-only; @nestjs/terminus must be installed in your app for types to resolve.
import type { HealthIndicatorResult } from '@nestjs/terminus';

async function dbCheck(ds: DataSource): Promise<HealthIndicatorResult> {
  return checkTypeOrmHealthy(ds);
}
```

You can also import `TypeOrmModule` and `typeorm` directly from this package via `core` re-exports if preferred.

```ts
import { Module } from '@nestjs/common';
import { CORE_ENTITIES, TypeOrmModule } from '@ecom-co/orm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        synchronize: false,
        logging: config.get('NODE_ENV') !== 'production',
        entities: CORE_ENTITIES, // [User, Product]
        // or set autoLoadEntities: true and register CORE_ENTITIES via forFeature in each module
      }),
    }),
  ],
})
export class AppModule {}
```

#### Feature modules with extended repositories

```ts
import { Module } from '@nestjs/common';
import { OrmModule, CORE_ENTITIES } from '@ecom-co/orm';

@Module({
  imports: [OrmModule.forFeatureExtended(CORE_ENTITIES)],
})
export class ExampleModule {}
```

Inject the extended repo in services using `BaseRepository<T>`:

```ts
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository, User } from '@ecom-co/orm';

export class ExampleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: BaseRepository<User>,
  ) {}
}
```

### Standalone DataSource Helpers

```ts
import { connectStandalone, disconnectStandalone, getCachedDataSource, CORE_ENTITIES } from '@ecom-co/orm';

const ds = await connectStandalone({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: CORE_ENTITIES,
});

// reuse later
const cached = getCachedDataSource();
await disconnectStandalone();
```

### Environment-based setup

```ts
import { OrmModule, CORE_ENTITIES } from '@ecom-co/orm';

OrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL, // e.g. postgres://user:pass@host:5432/db
  entities: CORE_ENTITIES,
  synchronize: false,
  health: true,
});
```

## Entities and Transformers

- Base entity: `OrmBaseEntity` with `id`, `createdAt`, `updatedAt`, `deletedAt`
- Core entities: `User`, `Product`
- Transformers: `BooleanTransformer`, `NumericTransformer`

## Migrations & Seeds (in this package)

We provide local CLI to manage migrations/seeds without including them in the build.

1) Prepare `.env` in this package root:

```env
DATABASE_URL=postgres://user:pass@host:5432/dbname
NODE_ENV=development
```

2) Generate migration from current entities (diff-based):

```bash
# with custom name/path (recommended → name by table)
npm run typeorm:generate -- src/migrations/users-drop-legacy-columns
npm run typeorm:generate -- src/migrations/products-add-sku

# or without args (TypeORM will auto-name)
npm run typeorm:generate
```

3) Create an empty migration file (manual):

```bash
npm run typeorm:create -- src/migrations/InitSomething
```

4) Run / Revert migrations:

```bash
npm run typeorm:run
npm run typeorm:revert
```

5) Seed:

```bash
npm run seed
```

Notes:
- Migration/seed sources live in `src/migrations`, `src/orm`, `src/seeds` and are excluded from build via `tsconfig.build.json`.
- If generate shows “No changes”, point to a fresh DB or create an empty migration and fill it.

## API

- `OrmModule.forRoot`, `OrmModule.forRootAsync` (arrow static methods)
- `checkTypeOrmHealthy(ds: DataSource)` returns `{ [key: string]: { status: 'up' | 'down'; latencyMs: number } }`
- Re-exports: `TypeOrmModule` and `typeorm` types under `core`
- Standalone helpers: `connectStandalone`, `disconnectStandalone`, `getCachedDataSource`

### BaseRepository helpers

`BaseRepository<T>` adds a few convenience methods:

```ts
await userRepo.findOneOrCreate({ email }, { name: 'Guest' });
await userRepo.findOneAndUpdate({ id }, { name: 'New' }, { upsert: true });
```

## Release

Convenience scripts:

```bash
npm run release:patch  # bump patch and publish
npm run release:minor  # bump minor and publish
npm run release:major  # bump major and publish
```

Ensure you are logged in to npm and the git working directory is clean. Push tags with `git push --follow-tags` if needed.
