import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    BaseEntity as TypeOrmBaseEntity,
    UpdateDateColumn,
} from 'typeorm';

export abstract class OrmBaseEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deletedAt', type: 'timestamptz', nullable: true })
    deletedAt?: Date | null;

    // Common helpers for all entities
    get isSoftDeleted(): boolean {
        return this.deletedAt != null;
    }

    clearDeleted(): void {
        this.deletedAt = null;
    }

    markDeleted(at: Date = new Date()): void {
        this.deletedAt = at;
    }
}
