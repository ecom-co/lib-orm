import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

export abstract class OrmBaseEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn({ type: 'timestamptz', name: 'createdAt' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updatedAt' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz', name: 'deletedAt', nullable: true })
    deletedAt?: Date | null;
}
