import assert from 'node:assert/strict';
import test from 'node:test';
import { mayTrack } from '../src/domain/tracking.ts';

test('rastreo solo con turno verificado, vigente y de duración limitada', () => {
  const now = Date.now();
  const grant = { verifiedByBackend: true, tenantId: 'a', driverId: 'd', shiftId: 's', expiresAt: now + 60_000 };
  assert.equal(mayTrack(grant, now), true);
  assert.equal(mayTrack({ ...grant, expiresAt: now - 1 }, now), false);
  assert.equal(mayTrack({ ...grant, expiresAt: now + 13 * 60 * 60 * 1000 }, now), false);
  assert.equal(mayTrack({ ...grant, driverId: '' }, now), false);
  assert.equal(mayTrack(null, now), false);
});
