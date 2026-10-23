import { useCallback, useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { applyAction, replay, type DriverAction, type QueuedAction, type Trip } from '../domain/driver';
import { MockDriverRepository } from '../infrastructure/mockDriverRepository';
import { SqliteQueue } from '../infrastructure/sqliteQueue';
import { clearDemoPhotos } from '../infrastructure/localPhotoStore';

const tenantId = 'demo-bogota';
const driverId = 'demo-conductor';
const repository = new MockDriverRepository();
const queue = new SqliteQueue();

export function usePilot() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pending, setPending] = useState<QueuedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentTrips = useRef<Trip[]>([]);
  const busy = useRef(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [base, actions] = await Promise.all([repository.listTrips(), queue.list(tenantId, driverId)]);
      const result = replay(base, actions);
      for (const id of result.conflicts) await queue.conflict(id);
      currentTrips.current = result.trips;
      setTrips(result.trips);
      setPending(await queue.list(tenantId, driverId));
      setError(null);
    } catch {
      setError('No se pudieron leer los datos locales.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const dispatch = useCallback(async (action: DriverAction): Promise<boolean> => {
    if (busy.current) return false;
    busy.current = true;
    try {
      const result = applyAction(currentTrips.current, action);
      if (!result.ok) { setError(result.error); return false; }
      const item: QueuedAction = {
        id: Crypto.randomUUID(), tenantId, driverId, createdAt: new Date().toISOString(), action, state: 'pending'
      };
      await queue.append(item);
      currentTrips.current = result.trips;
      setTrips(result.trips);
      setPending(items => [...items, item]);
      setError(null);
      return true;
    } catch {
      setError('No se pudo guardar la acción en este dispositivo.');
      return false;
    } finally {
      busy.current = false;
    }
  }, []);

  const reset = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      await queue.clear(tenantId, driverId);
      clearDemoPhotos();
      const base = await repository.listTrips();
      currentTrips.current = base;
      setTrips(base);
      setPending([]);
      setError(null);
    } catch {
      setError('No se pudo reiniciar la demostración.');
    } finally {
      busy.current = false;
    }
  }, []);

  return { trips, pending, loading, error, dispatch, reload, reset };
}
