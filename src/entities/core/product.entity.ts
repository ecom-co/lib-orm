import { Column, Entity } from 'typeorm';

import { OrmBaseEntity } from '../base.entity';

@Entity({ name: 'products' })
export class Product extends OrmBaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    description!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;
}
