import 'reflect-metadata';
import dataSource from './data-source';
import { runSeeds } from '../seeds';

const main = async (): Promise<void> => {
    const ds = await dataSource.initialize();
    try {
        await runSeeds(ds);
    } finally {
        if (ds.isInitialized) await ds.destroy();
    }
};

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
