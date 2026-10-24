import { ImageBackground, ScrollView, Text, View } from 'react-native';
import type { Pilot } from '../types';
import { Button, InfoPanel, Notice, SectionHeader } from '../components';
import { AppHeader, StatCard } from '../widgets';
import { useTheme } from '../ThemeProvider';

export function HomeScreen({ pilot, openTrip, goTrips, goMetrics, goProfile }: {
  pilot: Pilot; openTrip: (id: string) => void; goTrips: () => void; goMetrics: () => void; goProfile: () => void;
}) {
  const { styles } = useTheme();
  const nextTrip = pilot.trips.find(trip => trip.status === 'active') ?? pilot.trips.find(trip => trip.status === 'accepted') ?? pilot.trips.find(trip => trip.status === 'assigned');
  const deliveries = pilot.trips.reduce((sum, trip) => sum + trip.stops.filter(stop => stop.status === 'completed').length, 0);
  return <ScrollView style={styles.homeScroll} contentContainerStyle={styles.homeContent}>
    <ImageBackground source={require('../../../assets/images/driver-hero.png')} style={styles.hero} imageStyle={styles.heroImage} resizeMode="cover">
      <AppHeader onProfile={goProfile} />
      <Text style={styles.heroOverline}>Buenos días,</Text>
      <Text style={styles.heroTitle}>Conductor 👋</Text>
      <Text style={styles.heroSubtitle}>Tu jornada, clara en cada parada.</Text>
    </ImageBackground>
    <View style={styles.homeBody}>
      <Notice title="Modo demostración">Los datos son ficticios. Las acciones quedan en este dispositivo y no se envían al servidor.</Notice>
      <SectionHeader title="Resumen de hoy" action="Ver detalle" onAction={goMetrics} />
      <View style={styles.stats}>
        <StatCard number={pilot.trips.filter(trip => trip.status !== 'completed').length} label="Viajes" icon="bus" tone="blue" />
        <StatCard number={deliveries} label="Entregas" icon="cube" tone="orange" />
        <StatCard number={pilot.pending.length} label="Locales" icon="location" tone="red" />
      </View>
      <SectionHeader title="Siguiente paso" />
      <View style={styles.nextCard}>
        <Text style={styles.nextEyebrow}>{nextTrip ? nextTrip.code : 'Tu ruta te espera'}</Text>
        <Text style={styles.nextTitle}>{nextTrip ? nextTrip.route : 'Tu ruta te espera'}</Text>
        <Text style={styles.nextBody}>{nextTrip ? `${nextTrip.stops.length} paradas · ${nextTrip.scheduledAt}` : 'Revisa y acepta uno de los viajes asignados.'}</Text>
        <Button label={nextTrip ? 'Ver viaje' : 'Ver viajes'} icon="arrow-forward" onPress={nextTrip ? () => openTrip(nextTrip.id) : goTrips} />
      </View>
      <InfoPanel title="Ubicación y notificaciones">Se activarán cuando exista un turno validado y contratos de backend disponibles. Esta demostración no rastrea tu ubicación.</InfoPanel>
    </View>
  </ScrollView>;
}
