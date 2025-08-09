import { Column, Entity } from 'typeorm';

import { OrmBaseEntity } from '../base.entity';

@Entity({
    name: 'users',
})
export class User extends OrmBaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;
}
