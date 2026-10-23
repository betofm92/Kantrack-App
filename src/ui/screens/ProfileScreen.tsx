import { Alert } from 'react-native';
import type { Pilot } from '../types';
import { Body, Button, CardTitle, Divider, Eyebrow, Heading, InfoTitle, Panel, Screen, SectionTitle } from '../components';

export function ProfileScreen({ pilot }: { pilot: Pilot }) {
  const confirmReset = () => Alert.alert('Reiniciar demostración', 'Se borrarán las acciones guardadas localmente.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Reiniciar', style: 'destructive', onPress: () => { void pilot.reset(); } }
  ]);
  return <Screen><Eyebrow>CUENTA DE DEMOSTRACIÓN</Eyebrow><Heading>Mi perfil</Heading>
    <Panel><CardTitle>Conductor de prueba</CardTitle><Body>Tenant demo-bogota · ID demo-conductor</Body><Divider /><Body>Vehículo: Van 12 · KTW 418</Body></Panel>
    <SectionTitle>Estado de la app</SectionTitle>
    <Panel><InfoTitle>Conexión al backend</InfoTitle><Body>No conectada. El contrato de autenticación, viajes, turnos, POD y SOS está pendiente.</Body>
      <Divider /><InfoTitle>Acciones en dispositivo</InfoTitle><Body>{pilot.pending.length} acción(es) guardada(s).</Body></Panel>
    <Button label="Reiniciar datos de demostración" variant="outline" onPress={confirmReset} />
  </Screen>;
}
