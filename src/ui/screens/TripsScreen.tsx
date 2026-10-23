import type { Pilot } from '../types';
import { Eyebrow, Heading, Screen, Spacer, Subtitle } from '../components';
import { TripCard } from '../widgets';

export function TripsScreen({ pilot, openTrip }: { pilot: Pilot; openTrip: (id: string) => void }) {
  return <Screen><Eyebrow>TU JORNADA</Eyebrow><Heading>Viajes</Heading><Subtitle>Rutas asignadas para esta demostración.</Subtitle>
    <Spacer />{pilot.trips.map(trip => <TripCard key={trip.id} trip={trip} onPress={() => openTrip(trip.id)} />)}
  </Screen>;
}
