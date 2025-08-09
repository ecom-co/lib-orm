import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

export const createAppDataSource = (options: DataSourceOptions) => new DataSource(options);
