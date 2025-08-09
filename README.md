# @ecom-co/orm

Shared TypeORM layer for e-commerce projects: entities, transformers, Nest helpers, and DataSource utilities.

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

#### forRootAsync

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

#### forFeature in feature modules

```ts
import { Module } from '@nestjs/common';
import { CORE_ENTITIES, TypeOrmModule } from '@ecom-co/orm';

@Module({
  imports: [TypeOrmModule.forFeature(CORE_ENTITIES)],
})
export class ExampleModule {}
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

## Release

Convenience scripts:

```bash
npm run release:patch  # bump patch and publish
npm run release:minor  # bump minor and publish
npm run release:major  # bump major and publish
```

Ensure you are logged in to npm and the git working directory is clean. Push tags with `git push --follow-tags` if needed.
