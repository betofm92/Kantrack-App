import { useState } from 'react';
import { Linking, View } from 'react-native';
import type { DriverAction, Stop, Trip } from '../../domain/driver';
import type { Pilot } from '../types';
import { BackLink, Body, Button, Chip, Eyebrow, FieldInput, Heading, InfoPanel, PhotoPreview, Screen, SectionTitle, Spacer, Subtitle } from '../components';
import { PhotoPickerButtons } from '../widgets';
import { stopLabel } from '../labels';
import { usePhotoPicker } from '../usePhotoPicker';
import { styles } from '../theme';

export function StopDetailScreen({ trip, stop, pilot, back }: { trip: Trip; stop: Stop; pilot: Pilot; back: () => void }) {
  const [reason, setReason] = useState('');
  const picker = usePhotoPicker();
  const act = async (action: DriverAction) => { if (await pilot.dispatch(action)) back(); };
  return <Screen keyboard>
    <BackLink label="Volver al viaje" onPress={back} /><Spacer />
    <Eyebrow>{stop.orderCode} · {stop.window}</Eyebrow><Heading>{stop.customer}</Heading><Subtitle>{stop.address}</Subtitle>
    <View style={styles.actionBlock}><Button label="Abrir dirección en mapas" variant="outline" onPress={() => {
      void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`);
    }} /></View>
    <Chip label={stopLabel[stop.status]} tone={stop.status === 'completed' ? 'success' : stop.status === 'failed' ? 'warning' : 'neutral'} />
    {trip.status !== 'active' && <InfoPanel>Inicia el viaje para registrar acciones en esta parada.</InfoPanel>}
    {trip.status === 'active' && stop.status === 'pending' && <View style={styles.actionBlock}><Button label="Confirmar llegada" onPress={() => { void act({ kind: 'arriveStop', tripId: trip.id, stopId: stop.id }); }} /></View>}
    {trip.status === 'active' && stop.status === 'arrived' && <>
      <SectionTitle>Prueba de entrega</SectionTitle>
      <Body>{stop.proofRequired ? 'Adjunta una foto para confirmar la entrega.' : 'La foto es opcional en esta parada.'}</Body>
      <View style={styles.actionBlock}><PhotoPickerButtons picker={picker} /></View>
      <Button label="Confirmar entrega" disabled={stop.proofRequired && !picker.photoUri} onPress={() => { void act({ kind: 'completeStop', tripId: trip.id, stopId: stop.id, proofUri: picker.photoUri }); }} />
      <SectionTitle>No entregado</SectionTitle>
      <FieldInput placeholder="Motivo de no entrega" value={reason} onChangeText={setReason} multiline accessibilityLabel="Motivo de no entrega" />
      <Button label="Registrar no entrega" variant="outline" disabled={!reason.trim()} onPress={() => { void act({ kind: 'failStop', tripId: trip.id, stopId: stop.id, reason }); }} />
    </>}
    {stop.proofUri && <><SectionTitle>Foto registrada localmente</SectionTitle><PhotoPreview uri={stop.proofUri} label="Foto registrada" /></>}
    {stop.reason && <InfoPanel title="Motivo">{stop.reason}</InfoPanel>}
  </Screen>;
}
