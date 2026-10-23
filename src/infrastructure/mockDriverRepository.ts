import type { DriverAction, Trip } from '../domain/driver';
import type { DriverRepository } from '../domain/ports';

const fixtures: Trip[] = [
  {
    id: 'demo-trip-1', code: 'VJ-0248', route: 'Bogotá Norte', vehicle: 'Van 12 · KTW 418',
    scheduledAt: 'Hoy · 08:30', status: 'assigned', stops: [
      { id: 'demo-stop-1', orderCode: 'PD-3841', customer: 'Comercial Andina', address: 'Calle 116 # 15-24, Usaquén', window: '09:00–10:00', status: 'pending', proofRequired: true },
      { id: 'demo-stop-2', orderCode: 'PD-3842', customer: 'Bodega del Norte', address: 'Carrera 19 # 134-21, Cedritos', window: '10:30–11:30', status: 'pending', proofRequired: true },
      { id: 'demo-stop-3', orderCode: 'PD-3843', customer: 'Distribuidora Salitre', address: 'Av. Boyacá # 53-18, Salitre', window: '12:00–13:00', status: 'pending', proofRequired: false }
    ]
  },
  {
    id: 'demo-trip-2', code: 'VJ-0249', route: 'Centro y Chapinero', vehicle: 'Van 12 · KTW 418',
    scheduledAt: 'Mañana · 08:00', status: 'assigned', stops: [
      { id: 'demo-stop-4', orderCode: 'PD-3844', customer: 'Café Capital', address: 'Carrera 7 # 72-41, Chapinero', window: '08:30–09:30', status: 'pending', proofRequired: true }
    ]
  }
];

export class MockDriverRepository implements DriverRepository {
  async listTrips(): Promise<Trip[]> {
    return fixtures.map(trip => ({ ...trip, stops: trip.stops.map(stop => ({ ...stop })) }));
  }
  async send(_action: DriverAction, _idempotencyKey: string): Promise<void> {
    throw new Error('La demostración no envía datos al servidor.');
  }
}
