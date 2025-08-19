import type { ValueTransformer } from 'typeorm';

export class BooleanTransformer implements ValueTransformer {
    from(value: unknown): boolean | null {
        if (value == null) return null;

        return value === 1 || value === true || value === '1';
    }

    to(value?: boolean | null): 0 | 1 | null | undefined {
        if (value == null) return value;

        return value ? 1 : 0;
    }
}

export class NumericTransformer implements ValueTransformer {
    from(value: unknown): null | number {
        if (value == null) return null;

        const n = Number(value);

        return Number.isNaN(n) ? null : n;
    }

    to(value?: null | number): null | number | undefined {
        return value ?? null;
    }
}
