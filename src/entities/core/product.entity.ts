import { Column, Entity, ManyToOne } from 'typeorm';

import { OrmBaseEntity } from '../base.entity';

import { User } from './user.entity';

@Entity({ name: 'products' })
export class Product extends OrmBaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'varchar', length: 255 })
    description!: string;

    @Column({ name: 'userId' })
    userId!: number;

    @ManyToOne(() => User, (user) => user.products, {
        cascade: true,
        eager: true,
    })
    user!: User;
}
