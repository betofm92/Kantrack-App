import type { Pilot } from '../types';
import { Body, CardTitle, Eyebrow, Heading, Notice, Panel, Screen, Subtitle } from '../components';
import { ActivityCard } from '../widgets';

export function ActivityScreen({ pilot }: { pilot: Pilot }) {
  return <Screen><Eyebrow>REGISTRO LOCAL</Eyebrow><Heading>Actividad</Heading>
    <Subtitle>Acciones guardadas en este dispositivo.</Subtitle>
    <Notice title="Sin sincronización">El backend aún no ofrece el contrato de acciones móviles. Ninguna acción, incluida SOS, sale del dispositivo.</Notice>
    {pilot.pending.length === 0 ? <Panel><CardTitle>Aún no hay acciones</CardTitle><Body>Acepta un viaje para comenzar.</Body></Panel> :
      [...pilot.pending].reverse().map(item => <ActivityCard key={item.id} action={item.action.kind} timestamp={item.createdAt} conflict={item.state === 'conflict'} />)}
  </Screen>;
}
