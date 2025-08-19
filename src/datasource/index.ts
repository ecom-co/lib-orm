import 'reflect-metadata';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';

export const createAppDataSource = (options: DataSourceOptions) => new DataSource(options);
