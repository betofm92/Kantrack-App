import { Text, View } from 'react-native';
import type { Pilot } from '../types';
import { Body, Panel, Screen, ScreenHeader, SectionTitle } from '../components';
import { ActivityBarChart, MetricTile } from '../widgets';
import { useTheme } from '../ThemeProvider';

export function MetricsScreen({ pilot, back }: { pilot: Pilot; back: () => void }) {
  const { styles } = useTheme();
  const stops = pilot.trips.flatMap(trip => trip.stops);
  const completed = stops.filter(stop => stop.status === 'completed').length;
  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - offset));
    return {
      label: new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date).replace('.', '').slice(0, 3),
      value: pilot.pending.filter(item => new Date(item.createdAt).toDateString() === date.toDateString()).length,
      today: offset === 6
    };
  });
  return <Screen>
    <ScreenHeader title="Mis métricas" onBack={back} />
    <Panel><Text style={styles.cardTitle}>Resumen local</Text><Body>Datos de los viajes y acciones de esta demostración.</Body></Panel>
    <View style={styles.metricGrid}>
      <MetricTile number={pilot.trips.length} label="Viajes" icon="bus" tone="blue" />
      <MetricTile number={stops.length} label="Paradas" icon="location" tone="green" />
      <MetricTile number={completed} label="Entregas" icon="cube" tone="orange" />
      <MetricTile number={pilot.pending.length} label="Acciones locales" icon="stats-chart" tone="purple" />
    </View>
    <SectionTitle>Actividad de la semana</SectionTitle>
    <Panel><Text style={styles.cardTitle}>Acciones registradas</Text>
      <ActivityBarChart bars={days} />
      <Body>El gráfico muestra únicamente acciones guardadas en este dispositivo.</Body>
    </Panel>
  </Screen>;
}
