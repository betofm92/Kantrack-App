import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import type { Stop, Trip } from '../domain/driver';
import type { Pilot, Tab } from './types';
import { actionLabel, stopLabel, tripLabel } from './labels';
import { Button, Body, CardTitle, Chip, Divider, Eyebrow, Hint, LinkText, Panel, PhotoPreview, Row } from './components';
import { colors, styles } from './theme';
import type { usePhotoPicker } from './usePhotoPicker';

export function AppHeader() {
  return <View style={styles.header}><View><Text style={styles.brand}>KANTRACK</Text><Text style={styles.brandSub}>CONDUCTOR</Text></View>
    <View style={styles.demoBadge}><Text style={styles.demoText}>DEMO</Text></View></View>;
}

export function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  return <Pressable accessibilityRole="button" onPress={retry} style={styles.error}>
    <Text style={styles.errorText}>{message} · Toca para reintentar</Text>
  </Pressable>;
}

export function LoadingState() {
  return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /><Body>Preparando tu jornada…</Body></View>;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'inicio', label: 'Inicio' }, { id: 'viajes', label: 'Viajes' },
  { id: 'campo', label: 'Campo' }, { id: 'actividad', label: 'Actividad' }, { id: 'perfil', label: 'Perfil' }
];

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return <View style={styles.nav}>{tabs.map(tab => <Pressable key={tab.id} accessibilityRole="tab"
    accessibilityState={{ selected: active === tab.id }} onPress={() => onChange(tab.id)}
    style={[styles.navItem, active === tab.id && styles.navActive]}>
    <Text style={[styles.navText, active === tab.id && styles.navTextActive]}>{tab.label}</Text>
  </Pressable>)}</View>;
}

export function StatCard({ number, label }: { number: number; label: string }) {
  return <View style={styles.stat}><Text style={styles.statNumber}>{number}</Text><Body>{label}</Body></View>;
}

export function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const resolved = trip.stops.filter(stop => stop.status === 'completed' || stop.status === 'failed').length;
  return <Panel onPress={onPress}>
    <Row><Eyebrow>{trip.code}</Eyebrow><Chip label={tripLabel[trip.status]} tone={trip.status === 'active' ? 'success' : 'neutral'} /></Row>
    <CardTitle>{trip.route}</CardTitle><Body>{trip.scheduledAt} · {trip.vehicle}</Body>
    <Divider /><Row><Body>{resolved} de {trip.stops.length} paradas resueltas</Body><LinkText>Ver viaje ›</LinkText></Row>
  </Panel>;
}

export function StopCard({ stop, index, onPress }: { stop: Stop; index: number; onPress: () => void }) {
  return <Panel onPress={onPress}>
    <Row><Eyebrow>PARADA {index + 1} · {stop.orderCode}</Eyebrow><Chip label={stopLabel[stop.status]}
      tone={stop.status === 'completed' ? 'success' : stop.status === 'failed' ? 'warning' : 'neutral'} /></Row>
    <CardTitle>{stop.customer}</CardTitle><Body>{stop.address}</Body><Hint>Ventana: {stop.window}</Hint>
  </Panel>;
}

export function PhotoPickerButtons({ picker }: { picker: ReturnType<typeof usePhotoPicker> }) {
  return <><Row><View style={styles.flex}><Button label="Tomar foto" variant="outline" disabled={picker.choosing} onPress={() => { void picker.choose(true); }} /></View>
    <View style={styles.flex}><Button label="Galería" variant="outline" disabled={picker.choosing} onPress={() => { void picker.choose(false); }} /></View></Row>
    {picker.photoUri && <PhotoPreview uri={picker.photoUri} label="Foto adjunta" />}</>;
}

export function ChoiceChips<T extends string>({ options, value, onChange }: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return <View style={styles.reportTypes}>{options.map(option => <Pressable key={option.value}
    accessibilityRole="button" accessibilityState={{ selected: value === option.value }}
    style={[styles.reportType, value === option.value && styles.reportTypeActive]}
    onPress={() => onChange(option.value)}>
    <Text style={[styles.reportTypeText, value === option.value && styles.reportTypeTextActive]}>{option.label}</Text>
  </Pressable>)}</View>;
}

export function SosButton({ pilot, activeTripId }: { pilot: Pilot; activeTripId?: string }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const cancel = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; setHolding(false); };
  useEffect(() => cancel, []);

  const start = () => {
    cancel();
    setHolding(true);
    timer.current = setTimeout(() => {
      cancel();
      void pilot.dispatch({ kind: 'sos', tripId: activeTripId, message: 'Conductor solicita asistencia' }).then(ok => {
        if (ok) Alert.alert('Solicitud guardada en este dispositivo', 'Esta demostración no envía alertas. Para una emergencia real, llama a los servicios locales de emergencia.');
      });
    }, 2000);
  };
  return <View style={styles.helpContainer}><Pressable accessibilityRole="button"
    accessibilityLabel="Mantén pulsado para registrar una solicitud de ayuda local"
    onPressIn={start} onPressOut={cancel} style={[styles.helpButton, holding && styles.helpHolding]}>
    <Text style={styles.helpText}>SOS</Text>
  </Pressable></View>;
}

export function ActivityCard({ action, timestamp, conflict }: { action: keyof typeof actionLabel; timestamp: string; conflict: boolean }) {
  return <Panel><Row><CardTitle>{actionLabel[action]}</CardTitle><Chip label={conflict ? 'Conflicto' : 'Local'} tone={conflict ? 'warning' : 'neutral'} /></Row>
    <Body>{new Date(timestamp).toLocaleString('es-CO')}</Body></Panel>;
}
