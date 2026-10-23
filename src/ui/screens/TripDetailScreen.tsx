import { View } from 'react-native';
import type { DriverAction, Trip } from '../../domain/driver';
import { canFinish } from '../../domain/driver';
import type { Pilot } from '../types';
import { BackLink, Button, Chip, Eyebrow, Heading, Hint, Screen, SectionTitle, Spacer, Subtitle } from '../components';
import { StopCard } from '../widgets';
import { tripLabel } from '../labels';
import { styles } from '../theme';

export function TripDetailScreen({ trip, pilot, back, openStop }: { trip: Trip; pilot: Pilot; back: () => void; openStop: (id: string) => void }) {
  const act = (action: DriverAction) => { void pilot.dispatch(action); };
  return <Screen>
    <BackLink label="Volver a viajes" onPress={back} /><Spacer />
    <Eyebrow>{trip.code} · {trip.scheduledAt}</Eyebrow><Heading>{trip.route}</Heading><Subtitle>{trip.vehicle}</Subtitle>
    <Spacer /><Chip label={tripLabel[trip.status]} tone={trip.status === 'active' ? 'success' : 'neutral'} />
    {trip.status === 'assigned' && <View style={styles.actionBlock}><Button label="Aceptar viaje" onPress={() => act({ kind: 'acceptTrip', tripId: trip.id })} /></View>}
    {trip.status === 'accepted' && <View style={styles.actionBlock}><Button label="Iniciar viaje" onPress={() => act({ kind: 'startTrip', tripId: trip.id })} /><Hint>La ubicación no se inicia en este modo de demostración.</Hint></View>}
    {trip.status === 'active' && <View style={styles.actionBlock}><Button label="Finalizar viaje" disabled={!canFinish(trip)} onPress={() => act({ kind: 'finishTrip', tripId: trip.id })} /><Hint>Resuelve todas las paradas para finalizar.</Hint></View>}
    <SectionTitle>Paradas · {trip.stops.length}</SectionTitle>
    {trip.stops.map((stop, index) => <StopCard key={stop.id} stop={stop} index={index} onPress={() => openStop(stop.id)} />)}
  </Screen>;
}
