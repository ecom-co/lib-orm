# @ecom-co/orm

Shared TypeORM layer for e-commerce projects: entities, transformers, Nest helpers, and DataSource utilities.

## Installation

```bash
npm install @ecom-co/orm typeorm @nestjs/typeorm reflect-metadata
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

### NestJS

Root module:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Example } from '@ecom-co/orm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Example],
      synchronize: false
    }),
  ],
})
export class AppModule {}
```

Feature module:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Example } from '@ecom-co/orm';

@Module({
  imports: [TypeOrmModule.forFeature([Example])],
})
export class ExampleModule {}
```

Or use helpers:

```ts
import { createTypeOrmRootModule, createTypeOrmFeatureModule } from '@ecom-co/orm';

createTypeOrmRootModule({ /* TypeOrmModuleOptions */ });
createTypeOrmFeatureModule([/* entities */]);
```

### Standalone DataSource Helpers

```ts
import { connectStandalone, disconnectStandalone, getCachedDataSource } from '@ecom-co/orm';

const ds = await connectStandalone({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [/* entities */],
});

// reuse later
const cached = getCachedDataSource();
await disconnectStandalone();
```

## Entities and Transformers

- Base entity: `OrmBaseEntity` with `id`, `createdAt`, `updatedAt`, `deletedAt`
- Example entities: `Example`, `User`
- Transformers: `BooleanTransformer`, `NumericTransformer`

## Release

Convenience scripts:

```bash
npm run release:patch  # bump patch and publish
npm run release:minor  # bump minor and publish
npm run release:major  # bump major and publish
```

Ensure you are logged in to npm and the git working directory is clean. Push tags with `git push --follow-tags` if needed.
