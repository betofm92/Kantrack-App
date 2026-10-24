import { useState } from 'react';
import type { Pilot } from '../types';
import { Body, CardTitle, Heading, Panel, Screen, SegmentedControl, Subtitle } from '../components';
import { TripCard } from '../widgets';

type Filter = 'assigned' | 'active' | 'completed';

export function TripsScreen({ pilot, openTrip }: { pilot: Pilot; openTrip: (id: string) => void }) {
  const [filter, setFilter] = useState<Filter>('assigned');
  const trips = pilot.trips.filter(trip => filter === 'assigned' ? trip.status === 'assigned' || trip.status === 'accepted' :
    filter === 'active' ? trip.status === 'active' : trip.status === 'completed');
  const assignedCount = pilot.trips.filter(trip => trip.status === 'assigned' || trip.status === 'accepted').length;
  return <Screen><Heading>Mis viajes</Heading><Subtitle>Revisa y administra tus viajes asignados.</Subtitle>
    <SegmentedControl options={[
      { value: 'assigned', label: `Asignados ${assignedCount}` },
      { value: 'active', label: 'En curso' },
      { value: 'completed', label: 'Historial' }
    ]} value={filter} onChange={setFilter} />
    {trips.length === 0 ? <Panel><CardTitle>No hay viajes en esta sección</CardTitle><Body>Los viajes aparecerán aquí cuando cambien de estado.</Body></Panel> :
      trips.map(trip => <TripCard key={trip.id} trip={trip} onPress={() => openTrip(trip.id)} onAction={
        trip.status === 'assigned' ? () => { void pilot.dispatch({ kind: 'acceptTrip', tripId: trip.id }); } :
          trip.status === 'accepted' ? () => { void pilot.dispatch({ kind: 'startTrip', tripId: trip.id }); } : undefined
      } />)}
  </Screen>;
}
