import { Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import type { Trip } from '../../domain/driver';
import { getDemoMapRoute } from '../../infrastructure/demoMapRoutes';
import { Button, Panel, Row } from '../components';
import { useTheme } from '../ThemeProvider';

export function MapScreen({ trip, openTrip, openReports, goTrips }: {
  trip?: Trip; openTrip: () => void; openReports: () => void; goTrips: () => void;
}) {
  const { colors, styles, mode } = useTheme();
  const demoRoute = trip && getDemoMapRoute(trip.id);
  const resolved = trip?.stops.filter(stop => stop.status === 'completed' || stop.status === 'failed').length ?? 0;
  const total = trip?.stops.length ?? 0;
  const nextStop = trip?.stops.find(stop => stop.status === 'pending' || stop.status === 'arrived');
  return <View style={styles.mapPage}>
    <View style={styles.mapTop}><View><Text style={styles.mapTopTitle}>{trip ? trip.code : 'Mapa de ruta'}</Text>
      <Text style={styles.mapTopMeta}>{trip?.route ?? 'Sin viaje seleccionado'} · DEMO</Text></View>
      <Button label="Viajes" variant="outline" onPress={goTrips} /></View>
    {demoRoute ? <View style={styles.flex}>
      <MapView style={styles.map} initialRegion={{ ...demoRoute.center, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
        userInterfaceStyle={mode} showsUserLocation={false} showsMyLocationButton={false}>
        <Polyline coordinates={demoRoute.points} strokeColor={colors.accentBlue} strokeWidth={4} />
        {trip?.stops.map((stop, index) => {
          const pointIndex = Math.round((index + 1) * (demoRoute.points.length - 1) / trip.stops.length);
          const coordinate = demoRoute.points[pointIndex];
          return coordinate ? <Marker key={stop.id} coordinate={coordinate} title={stop.customer} description="Punto ilustrativo" pinColor={stop.status === 'completed' ? colors.successInk : colors.primary} /> : null;
        })}
      </MapView>
      <View style={styles.mapBadge}><Text style={styles.mapBadgeText}>Ruta ilustrativa · Sin ubicación ni seguimiento en vivo</Text></View>
    </View> : <View style={styles.center}><Panel><Text style={styles.cardTitle}>Mapa de demostración</Text>
      <Text style={styles.body}>Selecciona un viaje de demostración para ver una ruta ilustrativa.</Text></Panel></View>}
    <View style={styles.mapFooter}>
      <Row><Text style={styles.cardTitle}>Progreso del viaje</Text><Text style={styles.body}>{resolved}/{total} paradas</Text></Row>
      <View style={styles.mapProgress}><View style={[styles.mapProgressFill, { width: `${total ? 100 * resolved / total : 0}%` }]} /></View>
      <View style={styles.mapFooterMeta}>
        <View style={styles.mapFooterItem}><Text style={styles.mapFooterLabel}>Siguiente parada</Text>
          <Text style={styles.mapFooterValue}>{nextStop?.customer ?? 'Sin pendientes'}</Text></View>
        <View style={styles.mapFooterItem}><Text style={styles.mapFooterLabel}>Estado</Text>
          <Text style={styles.mapFooterValue}>{trip?.status === 'active' ? 'En curso' : trip?.status === 'completed' ? 'Finalizado' : 'Sin iniciar'}</Text></View>
      </View>
      <View style={styles.actionBlock}>
        {trip && <Button label="Ver detalle del viaje" variant="dark" icon="open-outline" onPress={openTrip} />}
        <Button label="Reporte de campo" variant="outline" icon="document-text-outline" onPress={openReports} />
      </View>
    </View>
  </View>;
}
