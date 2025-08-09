import { Column, Entity } from 'typeorm';

import { OrmBaseEntity } from './base.entity';
import { BooleanTransformer, NumericTransformer } from '../transformers';

@Entity({ name: 'examples' })
export class Example extends OrmBaseEntity {
    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @Column({ type: 'int', name: 'isActive', default: 1, transformer: new BooleanTransformer() })
    isActive!: boolean;

    @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: new NumericTransformer() })
    price?: number | null;
}
