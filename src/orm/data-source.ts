import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { CORE_ENTITIES } from '../entities/core';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
}

const isProduction = process.env.NODE_ENV === 'production';

const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: CORE_ENTITIES,
    migrations: ['src/migrations/*.{ts,js}'],
    migrationsTableName: 'migrations',
    logging: !isProduction,
});

export default dataSource;
