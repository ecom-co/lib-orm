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
    entities: CORE_ENTITIES,
    logging: !isProduction,
    migrations: ['src/migrations/*.{ts,js}'],
    migrationsTableName: 'migrations',
    url: databaseUrl,
});

export default dataSource;
