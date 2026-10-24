import { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import type { DriverAction, Stop, Trip } from '../../domain/driver';
import type { Pilot } from '../types';
import { AppIcon, Body, Button, Chip, FieldInput, InfoPanel, PhotoPreview, Screen, ScreenHeader, SectionTitle } from '../components';
import { PhotoPickerButtons } from '../widgets';
import { stopLabel } from '../labels';
import { usePhotoPicker } from '../usePhotoPicker';
import { useTheme } from '../ThemeProvider';

export function StopDetailScreen({ trip, stop, pilot, back }: { trip: Trip; stop: Stop; pilot: Pilot; back: () => void }) {
  const { colors, styles } = useTheme();
  const [reason, setReason] = useState('');
  const picker = usePhotoPicker();
  const act = async (action: DriverAction) => { if (await pilot.dispatch(action)) back(); };
  return <Screen keyboard>
    <ScreenHeader title="Detalle de parada" onBack={back} />
    <View style={styles.detailHero}>
      <View style={styles.row}><Text style={styles.detailCode}>{stop.customer}</Text>
        <Chip label={stopLabel[stop.status]} tone={stop.status === 'completed' ? 'success' : stop.status === 'failed' ? 'danger' : stop.status === 'arrived' ? 'warning' : 'neutral'} /></View>
      <Text style={styles.detailMeta}>{stop.orderCode} · {stop.window}</Text>
      <View style={styles.tripLine}><AppIcon name="location-outline" size={16} color={colors.muted} /><Text style={styles.tripLineText}>{stop.address}</Text></View>
    </View>
    <View style={styles.actionBlock}><Button label="Abrir dirección en mapas" variant="outline" icon="navigate-outline" onPress={() => {
      void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`);
    }} /></View>
    {trip.status !== 'active' && <InfoPanel>Inicia el viaje para registrar acciones en esta parada.</InfoPanel>}
    {trip.status === 'active' && stop.status === 'pending' && <Button label="Confirmar llegada" icon="location-outline" onPress={() => { void act({ kind: 'arriveStop', tripId: trip.id, stopId: stop.id }); }} />}
    {trip.status === 'active' && stop.status === 'arrived' && <>
      <SectionTitle>Prueba de entrega</SectionTitle>
      <Body>{stop.proofRequired ? 'Adjunta una foto para confirmar la entrega.' : 'La foto es opcional en esta parada.'}</Body>
      <View style={styles.actionBlock}><PhotoPickerButtons picker={picker} /></View>
      <Button label="Confirmar entrega" icon="checkmark-circle-outline" disabled={stop.proofRequired && !picker.photoUri} onPress={() => { void act({ kind: 'completeStop', tripId: trip.id, stopId: stop.id, proofUri: picker.photoUri }); }} />
      <SectionTitle>No entregado</SectionTitle>
      <FieldInput placeholder="Motivo de no entrega" value={reason} onChangeText={setReason} multiline accessibilityLabel="Motivo de no entrega" />
      <Button label="Registrar no entrega" variant="outline" disabled={!reason.trim()} onPress={() => { void act({ kind: 'failStop', tripId: trip.id, stopId: stop.id, reason }); }} />
    </>}
    {stop.proofUri && <><SectionTitle>Foto registrada localmente</SectionTitle><PhotoPreview uri={stop.proofUri} label="Foto registrada" /></>}
    {stop.reason && <InfoPanel title="Motivo">{stop.reason}</InfoPanel>}
  </Screen>;
}
