import type { DriverAction, QueuedAction, Trip } from './driver';

export interface DriverRepository {
  listTrips(): Promise<Trip[]>;
  send(action: DriverAction, idempotencyKey: string): Promise<void>;
}

export interface ActionQueue {
  list(tenantId: string, driverId: string): Promise<QueuedAction[]>;
  append(action: QueuedAction): Promise<void>;
  conflict(id: string): Promise<void>;
  clear(tenantId: string, driverId: string): Promise<void>;
}
