import { describe, expect, it } from 'vitest';
import { DEFAULT_REGION, getRegion, REGIONS } from '../src/regions';

describe('regions', () => {
  it('defaults to India', () => {
    expect(DEFAULT_REGION.id).toBe('india');
    expect(DEFAULT_REGION.countryCode).toBe('IN');
  });

  it('falls back safely for unknown regions', () => {
    expect(getRegion('does-not-exist')).toBe(DEFAULT_REGION);
  });

  it('keeps the region registry extensible', () => {
    expect(Object.keys(REGIONS)).toContain('india');
    expect(DEFAULT_REGION.discoveryQueries.length).toBeGreaterThan(5);
  });
});
