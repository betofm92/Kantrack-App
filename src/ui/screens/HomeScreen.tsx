import { View } from 'react-native';
import type { Pilot } from '../types';
import { Body, Button, CardTitle, Eyebrow, Heading, InfoPanel, Notice, Panel, Screen, SectionTitle, Spacer, Subtitle } from '../components';
import { StatCard, TripCard } from '../widgets';
import { styles } from '../theme';

export function HomeScreen({ pilot, openTrip, goTrips }: { pilot: Pilot; openTrip: (id: string) => void; goTrips: () => void }) {
  const nextTrip = pilot.trips.find(trip => trip.status === 'active') ?? pilot.trips.find(trip => trip.status === 'accepted');
  return <Screen>
    <Eyebrow>PANEL DEL CONDUCTOR</Eyebrow>
    <Heading>Buen día, conductor.</Heading>
    <Subtitle>Tu jornada, clara en cada parada.</Subtitle>
    <Notice title="Modo demostración">Los datos son ficticios. Las acciones quedan en este dispositivo y no se envían al servidor.</Notice>
    <SectionTitle>Resumen de hoy</SectionTitle>
    <View style={styles.stats}>
      <StatCard number={pilot.trips.filter(trip => trip.status !== 'completed').length} label="Viajes" />
      <StatCard number={pilot.trips.reduce((sum, trip) => sum + trip.stops.filter(stop => stop.status === 'completed').length, 0)} label="Entregas" />
      <StatCard number={pilot.pending.length} label="Locales" />
    </View>
    <SectionTitle>Siguiente paso</SectionTitle>
    {nextTrip ? <TripCard trip={nextTrip} onPress={() => openTrip(nextTrip.id)} /> :
      <Panel><CardTitle>Tu ruta te espera</CardTitle><Body>Revisa y acepta uno de los viajes asignados.</Body><Spacer /><Button label="Ver viajes" onPress={goTrips} /></Panel>}
    <InfoPanel title="Ubicación y notificaciones">Se activarán únicamente cuando exista un turno validado y contratos de backend disponibles. Esta demostración no rastrea tu ubicación.</InfoPanel>
  </Screen>;
}
