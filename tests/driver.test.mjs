import assert from 'node:assert/strict';
import test from 'node:test';
import { applyAction, canFinish, replay, sendOrder } from '../src/domain/driver.ts';

const seed = () => [{ id: 't', code: 'T', route: 'R', vehicle: 'V', scheduledAt: 'Hoy', status: 'assigned', stops: [{ id: 's', orderCode: 'O', customer: 'C', address: 'A', window: '9', status: 'pending', proofRequired: true }] }];

test('aceptar, iniciar, llegar, entregar con POD y finalizar', () => {
  let trips = seed();
  assert.equal(applyAction(trips, { kind: 'startTrip', tripId: 't' }).ok, false);
  for (const action of [
    { kind: 'acceptTrip', tripId: 't' }, { kind: 'startTrip', tripId: 't' }, { kind: 'arriveStop', tripId: 't', stopId: 's' }
  ]) {
    const result = applyAction(trips, action);
    assert.equal(result.ok, true);
    trips = result.trips;
  }
  assert.equal(canFinish(trips[0]), false);
  assert.equal(applyAction(trips, { kind: 'completeStop', tripId: 't', stopId: 's' }).ok, false);
  const done = applyAction(trips, { kind: 'completeStop', tripId: 't', stopId: 's', proofUri: 'file://photo' });
  assert.equal(done.ok, true);
  assert.equal(canFinish(done.trips[0]), true);
  assert.equal(trips[0].stops[0].status, 'arrived');
  assert.equal(applyAction(done.trips, { kind: 'finishTrip', tripId: 't' }).ok, true);
});

test('rechaza incidencia sin motivo, múltiples viajes activos y SOS vacío', () => {
  const trips = seed();
  trips[0].status = 'active'; trips[0].stops[0].status = 'arrived';
  assert.equal(applyAction(trips, { kind: 'failStop', tripId: 't', stopId: 's', reason: ' ' }).ok, false);
  assert.equal(applyAction(trips, { kind: 'sos', message: ' ' }).ok, false);
  const second = seed(); second[0].id = 't2'; second[0].status = 'accepted';
  assert.equal(applyAction([...trips, ...second], { kind: 'startTrip', tripId: 't2' }).ok, false);
});

test('reproduce en orden local y prioriza SOS al sincronizar', () => {
  const items = [
    { id: '2', tenantId: 'A', driverId: 'D', createdAt: '2026-10-23T10:01:00Z', action: { kind: 'startTrip', tripId: 't' }, state: 'pending' },
    { id: '1', tenantId: 'A', driverId: 'D', createdAt: '2026-10-23T10:00:00Z', action: { kind: 'acceptTrip', tripId: 't' }, state: 'pending' },
    { id: '3', tenantId: 'A', driverId: 'D', createdAt: '2026-10-23T10:02:00Z', action: { kind: 'sos', message: 'ayuda' }, state: 'pending' }
  ];
  assert.equal(replay(seed(), items).trips[0].status, 'active');
  assert.equal(sendOrder(items)[0].action.kind, 'sos');
});

test('valida reportes de campo antes de persistirlos', () => {
  const trips = seed();
  assert.equal(applyAction(trips, { kind: 'fieldReport', reportType: 'incident', description: ' ' }).ok, false);
  assert.equal(applyAction(trips, { kind: 'fieldReport', reportType: 'expense', description: 'Peaje', amount: 0 }).ok, false);
  assert.equal(applyAction(trips, { kind: 'fieldReport', reportType: 'fuel', description: 'Tanqueo', amount: 45000, odometer: -1 }).ok, false);
  assert.equal(applyAction(trips, { kind: 'fieldReport', reportType: 'fuel', description: 'Tanqueo', amount: 45000, odometer: 28140 }).ok, true);
  assert.deepEqual(trips, seed());
});
