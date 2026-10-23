import type { DriverAction, Stop, Trip } from '../domain/driver';

export const tripLabel: Record<Trip['status'], string> = {
  assigned: 'Asignado', accepted: 'Aceptado', active: 'En ruta', completed: 'Finalizado'
};

export const stopLabel: Record<Stop['status'], string> = {
  pending: 'Pendiente', arrived: 'En parada', completed: 'Entregado', failed: 'No entregado'
};

export const actionLabel: Record<DriverAction['kind'], string> = {
  acceptTrip: 'Viaje aceptado', startTrip: 'Viaje iniciado', finishTrip: 'Viaje finalizado',
  arriveStop: 'Llegada registrada', completeStop: 'Entrega registrada', failStop: 'No entrega registrada',
  fieldReport: 'Reporte de campo', sos: 'Solicitud de ayuda local'
};
