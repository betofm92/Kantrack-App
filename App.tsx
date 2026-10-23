import { useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, View
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { usePilot } from './src/application/usePilot';
import { canFinish, type DriverAction, type Stop, type Trip } from './src/domain/driver';
import { preservePhoto } from './src/infrastructure/localPhotoStore';

type Tab = 'inicio' | 'viajes' | 'campo' | 'actividad' | 'perfil';
type Pilot = ReturnType<typeof usePilot>;
const ink = '#102C38';
const teal = '#007F73';

function Button({ label, onPress, outline = false, disabled = false, danger = false }: {
  label: string; onPress: () => void; outline?: boolean; disabled?: boolean; danger?: boolean;
}) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={[styles.button, outline && styles.buttonOutline, danger && styles.buttonDanger, disabled && styles.disabled]}>
    <Text style={[styles.buttonText, outline && styles.buttonOutlineText]}>{label}</Text>
  </Pressable>;
}

function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'good' | 'warn' }) {
  return <View style={[styles.chip, tone === 'good' && styles.chipGood, tone === 'warn' && styles.chipWarn]}>
    <Text style={styles.chipText}>{label}</Text>
  </View>;
}

const tripLabel: Record<Trip['status'], string> = {
  assigned: 'Asignado', accepted: 'Aceptado', active: 'En ruta', completed: 'Finalizado'
};
const stopLabel: Record<Stop['status'], string> = {
  pending: 'Pendiente', arrived: 'En parada', completed: 'Entregado', failed: 'No entregado'
};

function TripCard({ trip, open }: { trip: Trip; open: () => void }) {
  const done = trip.stops.filter(stop => stop.status === 'completed' || stop.status === 'failed').length;
  return <Pressable accessibilityRole="button" onPress={open} style={styles.card}>
    <View style={styles.rowBetween}><Text style={styles.eyebrow}>{trip.code}</Text><Chip label={tripLabel[trip.status]} tone={trip.status === 'active' ? 'good' : 'neutral'} /></View>
    <Text style={styles.cardTitle}>{trip.route}</Text>
    <Text style={styles.muted}>{trip.scheduledAt}  ·  {trip.vehicle}</Text>
    <View style={styles.divider} />
    <View style={styles.rowBetween}><Text style={styles.muted}>{done} de {trip.stops.length} paradas resueltas</Text><Text style={styles.link}>Ver viaje ›</Text></View>
  </Pressable>;
}

function Home({ pilot, openTrip, goTrips }: { pilot: Pilot; openTrip: (id: string) => void; goTrips: () => void }) {
  const active = pilot.trips.find(trip => trip.status === 'active') ?? pilot.trips.find(trip => trip.status === 'accepted');
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Text style={styles.eyebrow}>PANEL DEL CONDUCTOR</Text>
    <Text style={styles.hero}>Buen día, conductor.</Text>
    <Text style={styles.subtitle}>Tu jornada, clara en cada parada.</Text>
    <View style={styles.notice}><Text style={styles.noticeTitle}>Modo demostración</Text><Text style={styles.noticeBody}>Los datos son ficticios. Las acciones quedan en este dispositivo y no se envían al servidor.</Text></View>
    <Text style={styles.sectionTitle}>Resumen de hoy</Text>
    <View style={styles.stats}>
      <View style={styles.stat}><Text style={styles.statNumber}>{pilot.trips.filter(t => t.status !== 'completed').length}</Text><Text style={styles.muted}>Viajes</Text></View>
      <View style={styles.stat}><Text style={styles.statNumber}>{pilot.trips.reduce((sum, t) => sum + t.stops.filter(s => s.status === 'completed').length, 0)}</Text><Text style={styles.muted}>Entregas</Text></View>
      <View style={styles.stat}><Text style={styles.statNumber}>{pilot.pending.length}</Text><Text style={styles.muted}>Locales</Text></View>
    </View>
    <Text style={styles.sectionTitle}>Siguiente paso</Text>
    {active ? <TripCard trip={active} open={() => openTrip(active.id)} /> : <View style={styles.card}><Text style={styles.cardTitle}>Tu ruta te espera</Text><Text style={styles.muted}>Revisa y acepta uno de los viajes asignados.</Text><View style={styles.space} /><Button label="Ver viajes" onPress={goTrips} /></View>}
    <View style={styles.infoCard}><Text style={styles.infoTitle}>Ubicación y notificaciones</Text><Text style={styles.muted}>Se activarán únicamente cuando exista un turno validado y contratos de backend disponibles. Esta demostración no rastrea tu ubicación.</Text></View>
  </ScrollView>;
}

function TripDetail({ trip, pilot, back, openStop }: { trip: Trip; pilot: Pilot; back: () => void; openStop: (id: string) => void }) {
  const act = (action: DriverAction) => { void pilot.dispatch(action); };
  return <ScrollView contentContainerStyle={styles.scroll}>
    <Pressable onPress={back} accessibilityRole="button"><Text style={styles.link}>‹ Volver a viajes</Text></Pressable>
    <View style={styles.space} /><Text style={styles.eyebrow}>{trip.code} · {trip.scheduledAt}</Text>
    <Text style={styles.hero}>{trip.route}</Text><Text style={styles.subtitle}>{trip.vehicle}</Text>
    <View style={styles.space} /><Chip label={tripLabel[trip.status]} tone={trip.status === 'active' ? 'good' : 'neutral'} />
    {trip.status === 'assigned' && <View style={styles.actionBlock}><Button label="Aceptar viaje" onPress={() => act({ kind: 'acceptTrip', tripId: trip.id })} /></View>}
    {trip.status === 'accepted' && <View style={styles.actionBlock}><Button label="Iniciar viaje" onPress={() => act({ kind: 'startTrip', tripId: trip.id })} /><Text style={styles.hint}>La ubicación no se inicia en este modo de demostración.</Text></View>}
    {trip.status === 'active' && <View style={styles.actionBlock}><Button label="Finalizar viaje" disabled={!canFinish(trip)} onPress={() => act({ kind: 'finishTrip', tripId: trip.id })} /><Text style={styles.hint}>Resuelve todas las paradas para finalizar.</Text></View>}
    <Text style={styles.sectionTitle}>Paradas · {trip.stops.length}</Text>
    {trip.stops.map((stop, index) => <Pressable key={stop.id} style={styles.card} onPress={() => openStop(stop.id)} accessibilityRole="button">
      <View style={styles.rowBetween}><Text style={styles.eyebrow}>PARADA {index + 1} · {stop.orderCode}</Text><Chip label={stopLabel[stop.status]} tone={stop.status === 'completed' ? 'good' : stop.status === 'failed' ? 'warn' : 'neutral'} /></View>
      <Text style={styles.cardTitle}>{stop.customer}</Text><Text style={styles.muted}>{stop.address}</Text><Text style={styles.hint}>Ventana: {stop.window}</Text>
    </Pressable>)}
  </ScrollView>;
}

function StopDetail({ trip, stop, pilot, back }: { trip: Trip; stop: Stop; pilot: Pilot; back: () => void }) {
  const [reason, setReason] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [choosing, setChoosing] = useState(false);
  const act = async (action: DriverAction) => { if (await pilot.dispatch(action)) back(); };
  const choosePhoto = async (camera: boolean) => {
    setChoosing(true);
    try {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permiso requerido', 'Autoriza el acceso para adjuntar la prueba de entrega.'); return; }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets[0]?.uri) setPhotoUri(await preservePhoto(result.assets[0].uri));
    } catch { Alert.alert('No se pudo abrir la cámara o galería'); }
    finally { setChoosing(false); }
  };
  return <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
    <Pressable onPress={back} accessibilityRole="button"><Text style={styles.link}>‹ Volver al viaje</Text></Pressable>
    <View style={styles.space} /><Text style={styles.eyebrow}>{stop.orderCode} · {stop.window}</Text>
    <Text style={styles.hero}>{stop.customer}</Text><Text style={styles.subtitle}>{stop.address}</Text>
    <View style={styles.actionBlock}><Button label="Abrir dirección en mapas" outline onPress={() => { void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`); }} /></View>
    <Chip label={stopLabel[stop.status]} tone={stop.status === 'completed' ? 'good' : stop.status === 'failed' ? 'warn' : 'neutral'} />
    {trip.status !== 'active' && <View style={styles.infoCard}><Text style={styles.muted}>Inicia el viaje para registrar acciones en esta parada.</Text></View>}
    {trip.status === 'active' && stop.status === 'pending' && <View style={styles.actionBlock}><Button label="Confirmar llegada" onPress={() => { void act({ kind: 'arriveStop', tripId: trip.id, stopId: stop.id }); }} /></View>}
    {trip.status === 'active' && stop.status === 'arrived' && <>
      <Text style={styles.sectionTitle}>Prueba de entrega</Text>
      <Text style={styles.muted}>{stop.proofRequired ? 'Adjunta una foto para confirmar la entrega.' : 'La foto es opcional en esta parada.'}</Text>
      <View style={styles.actionBlock}><Button label="Tomar foto" outline disabled={choosing} onPress={() => { void choosePhoto(true); }} /><View style={styles.smallSpace} /><Button label="Elegir de galería" outline disabled={choosing} onPress={() => { void choosePhoto(false); }} /></View>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} accessibilityLabel="Foto de prueba de entrega" />}
      <Button label="Confirmar entrega" disabled={stop.proofRequired && !photoUri} onPress={() => { void act({ kind: 'completeStop', tripId: trip.id, stopId: stop.id, proofUri: photoUri }); }} />
      <Text style={styles.sectionTitle}>No entregado</Text>
      <TextInput style={styles.input} placeholder="Motivo de no entrega" value={reason} onChangeText={setReason} multiline accessibilityLabel="Motivo de no entrega" />
      <Button label="Registrar no entrega" outline disabled={!reason.trim()} onPress={() => { void act({ kind: 'failStop', tripId: trip.id, stopId: stop.id, reason }); }} />
    </>}
    {stop.proofUri && <><Text style={styles.sectionTitle}>Foto registrada localmente</Text><Image source={{ uri: stop.proofUri }} style={styles.preview} /></>}
    {stop.reason && <View style={styles.infoCard}><Text style={styles.infoTitle}>Motivo</Text><Text style={styles.muted}>{stop.reason}</Text></View>}
  </ScrollView>;
}

type ReportType = 'fuel' | 'expense' | 'incident' | 'inspection';
const reportNames: Record<ReportType, string> = { fuel: 'Combustible', expense: 'Gasto', incident: 'Incidencia', inspection: 'Inspección' };

function FieldReports({ pilot }: { pilot: Pilot }) {
  const [type, setType] = useState<ReportType>('incident');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [odometer, setOdometer] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [choosing, setChoosing] = useState(false);
  const addPhoto = async (camera: boolean) => {
    setChoosing(true);
    try {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permiso requerido', 'Autoriza el acceso para adjuntar una foto.'); return; }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets[0]?.uri) setPhotoUri(await preservePhoto(result.assets[0].uri));
    } catch { Alert.alert('No se pudo abrir la cámara o galería'); }
    finally { setChoosing(false); }
  };
  const save = async () => {
    const ok = await pilot.dispatch({
      kind: 'fieldReport', reportType: type, description: description.trim(),
      amount: type === 'fuel' || type === 'expense' ? Number(amount.replace(',', '.')) : undefined,
      odometer: type === 'fuel' ? Number(odometer.replace(',', '.')) : undefined, photoUri
    });
    if (ok) { setDescription(''); setAmount(''); setOdometer(''); setPhotoUri(undefined); Alert.alert('Reporte guardado', 'El reporte solo está en este dispositivo.'); }
  };
  return <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>OPERACIÓN EN CAMPO</Text><Text style={styles.hero}>Reportes</Text>
    <Text style={styles.subtitle}>Registra eventos de tu jornada. Todo queda local en el modo demo.</Text>
    <View style={styles.reportTypes}>{(Object.keys(reportNames) as ReportType[]).map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: type === item }} style={[styles.reportType, type === item && styles.reportTypeActive]} onPress={() => setType(item)}><Text style={[styles.reportTypeText, type === item && styles.reportTypeTextActive]}>{reportNames[item]}</Text></Pressable>)}</View>
    <Text style={styles.sectionTitle}>Nuevo reporte · {reportNames[type]}</Text>
    <TextInput style={styles.input} multiline placeholder={type === 'inspection' ? 'Resultado y defectos encontrados' : 'Describe lo ocurrido'} accessibilityLabel="Descripción del reporte" value={description} onChangeText={setDescription} />
    {(type === 'fuel' || type === 'expense') && <TextInput style={styles.input} placeholder="Valor" accessibilityLabel="Valor" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />}
    {type === 'fuel' && <TextInput style={styles.input} placeholder="Odómetro (km)" accessibilityLabel="Odómetro en kilómetros" keyboardType="decimal-pad" value={odometer} onChangeText={setOdometer} />}
    <View style={styles.rowBetween}><View style={styles.flex}><Button label="Tomar foto" outline disabled={choosing} onPress={() => { void addPhoto(true); }} /></View><View style={styles.flex}><Button label="Galería" outline disabled={choosing} onPress={() => { void addPhoto(false); }} /></View></View>
    {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} accessibilityLabel="Foto del reporte" />}
    <View style={styles.actionBlock}><Button label="Guardar reporte local" onPress={() => { void save(); }} /></View>
    <View style={styles.infoCard}><Text style={styles.muted}>Los formularios y códigos de validación definitivos dependen del contrato de CONNECT.</Text></View>
  </ScrollView>;
}

function Activity({ pilot }: { pilot: Pilot }) {
  return <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.eyebrow}>REGISTRO LOCAL</Text><Text style={styles.hero}>Actividad</Text>
    <Text style={styles.subtitle}>Acciones guardadas en este dispositivo.</Text>
    <View style={styles.notice}><Text style={styles.noticeTitle}>Sin sincronización</Text><Text style={styles.noticeBody}>El backend aún no ofrece el contrato de acciones móviles. Ninguna acción, incluida SOS, sale del dispositivo.</Text></View>
    {pilot.pending.length === 0 ? <View style={styles.card}><Text style={styles.cardTitle}>Aún no hay acciones</Text><Text style={styles.muted}>Acepta un viaje para comenzar.</Text></View> : [...pilot.pending].reverse().map(item => <View key={item.id} style={styles.card}><View style={styles.rowBetween}><Text style={styles.cardTitle}>{actionLabel(item.action.kind)}</Text><Chip label={item.state === 'conflict' ? 'Conflicto' : 'Local'} tone={item.state === 'conflict' ? 'warn' : 'neutral'} /></View><Text style={styles.muted}>{new Date(item.createdAt).toLocaleString('es-CO')}</Text></View>)}
  </ScrollView>;
}

function actionLabel(kind: DriverAction['kind']) {
  return ({ acceptTrip: 'Viaje aceptado', startTrip: 'Viaje iniciado', finishTrip: 'Viaje finalizado', arriveStop: 'Llegada registrada', completeStop: 'Entrega registrada', failStop: 'No entrega registrada', fieldReport: 'Reporte de campo', sos: 'Solicitud de ayuda local' })[kind];
}

function Profile({ pilot }: { pilot: Pilot }) {
  return <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.eyebrow}>CUENTA DE DEMOSTRACIÓN</Text><Text style={styles.hero}>Mi perfil</Text>
    <View style={styles.card}><Text style={styles.cardTitle}>Conductor de prueba</Text><Text style={styles.muted}>Tenant demo-bogota · ID demo-conductor</Text><View style={styles.divider} /><Text style={styles.muted}>Vehículo: Van 12 · KTW 418</Text></View>
    <Text style={styles.sectionTitle}>Estado de la app</Text>
    <View style={styles.card}><Text style={styles.infoTitle}>Conexión al backend</Text><Text style={styles.muted}>No conectada. El contrato de autenticación, viajes, turnos, POD y SOS está pendiente.</Text><View style={styles.divider} /><Text style={styles.infoTitle}>Acciones en dispositivo</Text><Text style={styles.muted}>{pilot.pending.length} acción(es) guardada(s).</Text></View>
    <Button label="Reiniciar datos de demostración" outline onPress={() => Alert.alert('Reiniciar demostración', 'Se borrarán las acciones guardadas localmente.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Reiniciar', style: 'destructive', onPress: () => { void pilot.reset(); } }])} />
  </ScrollView>;
}

function Help({ pilot, activeTripId }: { pilot: Pilot; activeTripId?: string }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setHolding(false); };
  return <View style={styles.helpContainer}><Pressable accessibilityRole="button" accessibilityLabel="Mantén pulsado para registrar solicitud de ayuda local"
    onPressIn={() => { setHolding(true); timer.current = setTimeout(() => { stop(); void pilot.dispatch({ kind: 'sos', tripId: activeTripId, message: 'Conductor solicita asistencia' }).then(ok => { if (ok) Alert.alert('Solicitud guardada en este dispositivo', 'Esta demostración no envía alertas. Para una emergencia real, llama a los servicios locales de emergencia.'); }); }, 2000); }}
    onPressOut={stop} style={[styles.helpButton, holding && styles.helpHolding]}><Text style={styles.helpText}>SOS</Text></Pressable></View>;
}

function AppContent() {
  const pilot = usePilot();
  const [tab, setTab] = useState<Tab>('inicio');
  const [tripId, setTripId] = useState<string | null>(null);
  const [stopId, setStopId] = useState<string | null>(null);
  const trip = pilot.trips.find(item => item.id === tripId);
  const stop = trip?.stops.find(item => item.id === stopId);
  const activeTrip = pilot.trips.find(item => item.status === 'active');
  const openTrip = (id: string) => { setTripId(id); setStopId(null); setTab('viajes'); };
  return <SafeAreaView style={styles.container} edges={['top', 'bottom']}><StatusBar barStyle="dark-content" backgroundColor="#F7FAF8" />
    <View style={styles.header}><View><Text style={styles.brand}>KANTRACK</Text><Text style={styles.brandSub}>CONDUCTOR</Text></View><View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View></View>
    {pilot.error && <Pressable onPress={() => { void pilot.reload(); }} style={styles.error}><Text style={styles.errorText}>{pilot.error} · Toca para reintentar</Text></Pressable>}
    {pilot.loading ? <View style={styles.center}><ActivityIndicator color={teal} size="large" /><Text style={styles.muted}>Preparando tu jornada…</Text></View> : <View style={styles.content}>
      {tab === 'inicio' && <Home pilot={pilot} openTrip={openTrip} goTrips={() => setTab('viajes')} />}
      {tab === 'viajes' && stop && trip ? <StopDetail key={stop.id} trip={trip} stop={stop} pilot={pilot} back={() => setStopId(null)} />
        : tab === 'viajes' && trip ? <TripDetail trip={trip} pilot={pilot} back={() => setTripId(null)} openStop={setStopId} />
        : tab === 'viajes' && <ScrollView contentContainerStyle={styles.scroll}><Text style={styles.eyebrow}>TU JORNADA</Text><Text style={styles.hero}>Viajes</Text><Text style={styles.subtitle}>Rutas asignadas para esta demostración.</Text><View style={styles.space} />{pilot.trips.map(item => <TripCard key={item.id} trip={item} open={() => openTrip(item.id)} />)}</ScrollView>}
      {tab === 'campo' && <FieldReports pilot={pilot} />}
      {tab === 'actividad' && <Activity pilot={pilot} />}
      {tab === 'perfil' && <Profile pilot={pilot} />}
    </View>}
    <Help pilot={pilot} activeTripId={activeTrip?.id} />
    <View style={styles.nav}>{(['inicio', 'viajes', 'campo', 'actividad', 'perfil'] as Tab[]).map(item => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }} onPress={() => { setTab(item); setTripId(null); setStopId(null); }} style={[styles.navItem, tab === item && styles.navActive]}><Text style={[styles.navText, tab === item && styles.navTextActive]}>{({ inicio: 'Inicio', viajes: 'Viajes', campo: 'Campo', actividad: 'Actividad', perfil: 'Perfil' })[item]}</Text></Pressable>)}</View>
  </SafeAreaView>;
}

export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAF8' }, content: { flex: 1 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  header: { paddingHorizontal: 22, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#E4ECE9' },
  brand: { color: ink, fontSize: 21, fontWeight: '900', letterSpacing: 2 }, brandSub: { color: teal, fontSize: 9, fontWeight: '800', letterSpacing: 3 },
  demoBadge: { backgroundColor: '#E1F4E8', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 }, demoText: { color: '#176B51', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  scroll: { padding: 22, paddingBottom: 110 }, eyebrow: { color: teal, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  hero: { color: ink, fontSize: 32, fontWeight: '800', marginTop: 9, lineHeight: 39 }, subtitle: { color: '#65767B', fontSize: 15, marginTop: 7, lineHeight: 22 },
  sectionTitle: { color: ink, fontSize: 19, fontWeight: '800', marginTop: 28, marginBottom: 14 },
  notice: { backgroundColor: '#E9F6F2', borderRadius: 17, padding: 17, marginTop: 24, borderLeftWidth: 4, borderLeftColor: teal },
  noticeTitle: { color: ink, fontSize: 14, fontWeight: '800' }, noticeBody: { color: '#4A6665', fontSize: 13, lineHeight: 19, marginTop: 5 },
  stats: { flexDirection: 'row', gap: 10 }, stat: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 17, alignItems: 'center', borderWidth: 1, borderColor: '#E5EDE9' },
  statNumber: { color: ink, fontSize: 24, fontWeight: '800' }, card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: '#E5EDE9' },
  cardTitle: { color: ink, fontSize: 17, fontWeight: '800', marginTop: 9, marginBottom: 6 }, muted: { color: '#64777A', fontSize: 13, lineHeight: 20 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, divider: { height: 1, backgroundColor: '#EDF1EF', marginVertical: 15 },
  link: { color: teal, fontSize: 13, fontWeight: '700' }, chip: { backgroundColor: '#EEF2F1', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, alignSelf: 'flex-start' },
  chipGood: { backgroundColor: '#E1F4E8' }, chipWarn: { backgroundColor: '#FFF0D7' }, chipText: { color: ink, fontSize: 10, fontWeight: '700' },
  infoCard: { backgroundColor: '#EFF5F3', borderRadius: 16, padding: 18, marginTop: 18 }, infoTitle: { color: ink, fontSize: 15, fontWeight: '800', marginBottom: 5 },
  actionBlock: { marginVertical: 22 }, button: { backgroundColor: teal, borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  buttonOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: teal }, buttonDanger: { backgroundColor: '#C74338' }, disabled: { opacity: 0.42 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 }, buttonOutlineText: { color: teal }, hint: { color: '#7A8887', fontSize: 12, marginTop: 9, lineHeight: 17 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E2DD', borderRadius: 12, padding: 13, minHeight: 70, textAlignVertical: 'top', marginBottom: 12, color: ink },
  preview: { width: '100%', height: 180, borderRadius: 14, marginBottom: 15, marginTop: 12 }, space: { height: 20 }, smallSpace: { height: 9 },
  reportTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 }, reportType: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E8EFEC' }, reportTypeActive: { backgroundColor: teal }, reportTypeText: { color: ink, fontSize: 12, fontWeight: '700' }, reportTypeTextActive: { color: '#FFFFFF' }, flex: { flex: 1 },
  error: { backgroundColor: '#FCE8E5', paddingHorizontal: 22, paddingVertical: 10 }, errorText: { color: '#9F332A', fontSize: 12 },
  helpContainer: { position: 'absolute', right: 17, bottom: 75 }, helpButton: { width: 57, height: 57, borderRadius: 29, backgroundColor: '#C74338', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.17, shadowRadius: 5 },
  helpHolding: { backgroundColor: '#84251F' }, helpText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  nav: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#E3ECE8', backgroundColor: '#FFFFFF', paddingVertical: 7, paddingHorizontal: 6 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9 }, navActive: { backgroundColor: '#E5F3EE' }, navText: { fontSize: 12, color: '#748581', fontWeight: '700' }, navTextActive: { color: teal }
});
