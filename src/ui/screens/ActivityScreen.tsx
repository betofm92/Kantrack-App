import type { Pilot } from '../types';
import { Body, CardTitle, Notice, Panel, Screen, ScreenHeader, SectionTitle, Subtitle } from '../components';
import { ActivityCard } from '../widgets';

export function ActivityScreen({ pilot }: { pilot: Pilot }) {
  const items = [...pilot.pending].reverse();
  return <Screen><ScreenHeader title="Actividad" />
    <Subtitle>Historial de acciones guardadas en este dispositivo.</Subtitle>
    <Notice title="Sin sincronización">El backend aún no ofrece el contrato de acciones móviles. Ninguna acción, incluida SOS, sale del dispositivo.</Notice>
    <SectionTitle>Actividad reciente</SectionTitle>
    {items.length === 0 ? <Panel><CardTitle>Aún no hay acciones</CardTitle><Body>Acepta un viaje para comenzar.</Body></Panel> :
      items.map(item => <ActivityCard key={item.id} action={item.action.kind} timestamp={item.createdAt} conflict={item.state === 'conflict'} />)}
  </Screen>;
}
