import type { ValueTransformer } from 'typeorm';

export class BooleanTransformer implements ValueTransformer {
    to(value?: boolean | null): 1 | 0 | null | undefined {
        if (value == null) return value;
        return value ? 1 : 0;
    }
    from(value: unknown): boolean | null {
        if (value == null) return null;
        return value === 1 || value === true || value === '1';
    }
}

export class NumericTransformer implements ValueTransformer {
    to(value?: number | null): number | null | undefined {
        return value ?? null;
    }
    from(value: unknown): number | null {
        if (value == null) return null;
        const n = Number(value);
        return Number.isNaN(n) ? null : n;
    }
}
