export type TripStatus = 'assigned' | 'accepted' | 'active' | 'completed';
export type StopStatus = 'pending' | 'arrived' | 'completed' | 'failed';

export interface Stop {
  id: string;
  orderCode: string;
  customer: string;
  address: string;
  window: string;
  status: StopStatus;
  proofRequired: boolean;
  proofUri?: string;
  reason?: string;
}

export interface Trip {
  id: string;
  code: string;
  route: string;
  vehicle: string;
  scheduledAt: string;
  status: TripStatus;
  stops: Stop[];
}

export type DriverAction =
  | { kind: 'acceptTrip'; tripId: string }
  | { kind: 'startTrip'; tripId: string }
  | { kind: 'finishTrip'; tripId: string }
  | { kind: 'arriveStop'; tripId: string; stopId: string }
  | { kind: 'completeStop'; tripId: string; stopId: string; proofUri?: string }
  | { kind: 'failStop'; tripId: string; stopId: string; reason: string }
  | { kind: 'fieldReport'; reportType: 'fuel' | 'expense' | 'incident' | 'inspection'; description: string; amount?: number; odometer?: number; photoUri?: string }
  | { kind: 'sos'; tripId?: string; message: string };

export type Transition = { ok: true; trips: Trip[] } | { ok: false; error: string };

export function canFinish(trip: Trip): boolean {
  return trip.status === 'active' && trip.stops.every(stop => stop.status === 'completed' || stop.status === 'failed');
}

export function applyAction(trips: Trip[], action: DriverAction): Transition {
  if (action.kind === 'fieldReport') {
    if (!action.description.trim()) return { ok: false, error: 'Escribe una descripción.' };
    if ((action.reportType === 'fuel' || action.reportType === 'expense') && !(action.amount && action.amount > 0))
      return { ok: false, error: 'El valor debe ser mayor que cero.' };
    if (action.reportType === 'fuel' && !(action.odometer && action.odometer > 0))
      return { ok: false, error: 'El odómetro debe ser mayor que cero.' };
    return { ok: true, trips };
  }
  if (action.kind === 'sos') {
    return action.message.trim() ? { ok: true, trips } : { ok: false, error: 'Escribe un mensaje de ayuda.' };
  }

  const original = trips.find(trip => trip.id === action.tripId);
  if (!original) return { ok: false, error: 'No se encontró el viaje.' };
  const next = trips.map(trip => ({ ...trip, stops: trip.stops.map(stop => ({ ...stop })) }));
  const trip = next.find(item => item.id === action.tripId)!;

  switch (action.kind) {
    case 'acceptTrip':
      if (trip.status !== 'assigned') break;
      trip.status = 'accepted';
      return { ok: true, trips: next };
    case 'startTrip':
      if (trip.status !== 'accepted' || next.some(item => item.id !== trip.id && item.status === 'active')) break;
      trip.status = 'active';
      return { ok: true, trips: next };
    case 'finishTrip':
      if (!canFinish(trip)) return { ok: false, error: 'Resuelve todas las paradas antes de terminar el viaje.' };
      trip.status = 'completed';
      return { ok: true, trips: next };
    case 'arriveStop':
    case 'completeStop':
    case 'failStop': {
      const stop = trip.stops.find(item => item.id === action.stopId);
      if (!stop) return { ok: false, error: 'No se encontró la parada.' };
      if (trip.status !== 'active') return { ok: false, error: 'Primero inicia el viaje.' };
      if (action.kind === 'arriveStop' && stop.status === 'pending') {
        stop.status = 'arrived';
        return { ok: true, trips: next };
      }
      if (action.kind === 'completeStop' && stop.status === 'arrived') {
        if (stop.proofRequired && !action.proofUri) return { ok: false, error: 'Adjunta la prueba de entrega.' };
        stop.status = 'completed';
        stop.proofUri = action.proofUri;
        return { ok: true, trips: next };
      }
      if (action.kind === 'failStop' && stop.status === 'arrived') {
        if (!action.reason.trim()) return { ok: false, error: 'Escribe el motivo de no entrega.' };
        stop.status = 'failed';
        stop.reason = action.reason.trim();
        return { ok: true, trips: next };
      }
      break;
    }
  }
  return { ok: false, error: 'La acción no corresponde al estado actual.' };
}

export interface QueuedAction {
  id: string;
  tenantId: string;
  driverId: string;
  createdAt: string;
  action: DriverAction;
  state: 'pending' | 'conflict';
}

export function replay(base: Trip[], pending: QueuedAction[]): { trips: Trip[]; conflicts: string[] } {
  let trips = base;
  const conflicts: string[] = [];
  for (const item of [...pending].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))) {
    const result = applyAction(trips, item.action);
    if (result.ok) trips = result.trips;
    else conflicts.push(item.id);
  }
  return { trips, conflicts };
}

export function sendOrder(items: QueuedAction[]): QueuedAction[] {
  return [...items].sort((a, b) => Number(b.action.kind === 'sos') - Number(a.action.kind === 'sos') || a.createdAt.localeCompare(b.createdAt));
}
