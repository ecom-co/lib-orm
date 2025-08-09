import { Column, Entity } from 'typeorm';

import { OrmBaseEntity } from '../base.entity';

@Entity({ name: 'users' })
export class Example extends OrmBaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'int', name: 'isActive', default: 1 })
    isActive!: boolean;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
    price?: number | null;
}
