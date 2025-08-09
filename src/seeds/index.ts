import type { DataSource } from 'typeorm';

export const runSeeds = async (_ds: DataSource): Promise<void> => {
    // Example seed scaffold. Add your seeders here.
    // const userRepo = ds.getRepository(User);
    // await userRepo.save(userRepo.create({ name: 'admin', isActive: true }));
};
