import 'reflect-metadata';
import { DataSource, type DataSourceOptions } from 'typeorm';

const dataSourceCache = new Map<string, DataSource>();

const getCacheKey = (options: DataSourceOptions): string => options.name ?? 'default';

export const connectStandalone = async (
    options: DataSourceOptions,
    { reuse = true }: { reuse?: boolean } = {},
): Promise<DataSource> => {
    const key = getCacheKey(options);

    if (reuse && dataSourceCache.has(key)) {
        const cached = dataSourceCache.get(key)!;

        if (cached.isInitialized) return cached;

        await cached.initialize();

        return cached;
    }

    const ds = new DataSource(options);

    await ds.initialize();

    if (reuse) dataSourceCache.set(key, ds);

    return ds;
};

export const getCachedDataSource = (name = 'default'): DataSource | undefined => dataSourceCache.get(name);

export const disconnectStandalone = async (name = 'default'): Promise<void> => {
    const ds = dataSourceCache.get(name);

    if (ds && ds.isInitialized) {
        await ds.destroy();
    }

    dataSourceCache.delete(name);
};
