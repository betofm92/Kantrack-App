import type { usePilot } from '../application/usePilot';

export type Pilot = ReturnType<typeof usePilot>;
export type Tab = 'inicio' | 'viajes' | 'mapa' | 'actividad' | 'perfil';
