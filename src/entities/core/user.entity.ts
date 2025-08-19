import { Column, Entity, OneToMany } from 'typeorm';

import { OrmBaseEntity } from '../base.entity';

import { Product } from './product.entity';

@Entity({ name: 'users' })
export class User extends OrmBaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @OneToMany(() => Product, (product) => product.user)
    products!: Product[];
}
