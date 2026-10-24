import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { DriverAction, Trip } from '../../domain/driver';
import { canFinish } from '../../domain/driver';
import type { Pilot } from '../types';
import { AppIcon, Body, Button, Chip, InfoPanel, Screen, ScreenHeader, SectionTitle } from '../components';
import { StopCard } from '../widgets';
import { tripLabel } from '../labels';
import { useTheme } from '../ThemeProvider';

export function TripDetailScreen({ trip, pilot, back, openStop, openMap }: {
  trip: Trip; pilot: Pilot; back: () => void; openStop: (id: string) => void; openMap: () => void;
}) {
  const { colors, styles } = useTheme();
  const [section, setSection] = useState<'stops' | 'info'>('stops');
  const act = (action: DriverAction) => { void pilot.dispatch(action); };
  return <Screen>
    <ScreenHeader title="Detalle de viaje" onBack={back} />
    <View style={styles.detailHero}>
      <View style={styles.row}><Text style={styles.detailCode}>{trip.code}</Text>
        <Chip label={tripLabel[trip.status]} tone={trip.status === 'active' ? 'success' : trip.status === 'assigned' ? 'warning' : 'neutral'} /></View>
      <Text style={styles.detailMeta}>{trip.scheduledAt}</Text>
      <View style={styles.divider} />
      <View style={styles.tripLine}><AppIcon name="time-outline" size={16} color={colors.muted} /><Text style={styles.tripLineText}>{trip.scheduledAt}</Text></View>
      <View style={styles.tripLine}><AppIcon name="navigate-outline" size={16} color={colors.muted} /><Text style={styles.tripLineText}>{trip.route}</Text></View>
      <View style={styles.tripLine}><AppIcon name="location-outline" size={16} color={colors.muted} /><Text style={styles.tripLineText}>{trip.stops.length} paradas</Text></View>
    </View>
    <View style={styles.detailTabs}>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: section === 'stops' }} onPress={() => setSection('stops')}
        style={[styles.detailTab, section === 'stops' && styles.detailTabActive]}><Text style={[styles.detailTabText, section === 'stops' && styles.detailTabTextActive]}>Paradas</Text></Pressable>
      <Pressable accessibilityRole="tab" accessibilityState={{ selected: section === 'info' }} onPress={() => setSection('info')}
        style={[styles.detailTab, section === 'info' && styles.detailTabActive]}><Text style={[styles.detailTabText, section === 'info' && styles.detailTabTextActive]}>Información</Text></Pressable>
    </View>
    {section === 'stops' ? trip.stops.map((stop, index) => <StopCard key={stop.id} stop={stop} index={index} onPress={() => openStop(stop.id)} />) :
      <><SectionTitle>Vehículo asignado</SectionTitle><InfoPanel>{trip.vehicle}</InfoPanel>
        <SectionTitle>Estado del viaje</SectionTitle><InfoPanel>Las acciones se guardan en este dispositivo. El mapa muestra una ruta ilustrativa; no existe rastreo en vivo.</InfoPanel></>}
    <View style={styles.actionBlock}>
      <Button label="Ver en mapa" variant="dark" icon="navigate-outline" onPress={openMap} />
      {trip.status === 'assigned' && <Button label="Aceptar viaje" icon="checkmark-circle-outline" onPress={() => act({ kind: 'acceptTrip', tripId: trip.id })} />}
      {trip.status === 'accepted' && <Button label="Iniciar viaje" icon="play-circle-outline" onPress={() => act({ kind: 'startTrip', tripId: trip.id })} />}
      {trip.status === 'active' && <Button label="Finalizar viaje" variant="danger" icon="stop-circle-outline" disabled={!canFinish(trip)} onPress={() => act({ kind: 'finishTrip', tripId: trip.id })} />}
      {trip.status === 'active' && !canFinish(trip) && <Body>Resuelve todas las paradas para finalizar.</Body>}
    </View>
  </Screen>;
}
