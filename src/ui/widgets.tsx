import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import type { Stop, Trip } from '../domain/driver';
import type { Pilot, Tab } from './types';
import { actionLabel, stopLabel, tripLabel } from './labels';
import { AppIcon, BrandLogo, Button, Body, Chip, PhotoPreview, Row, type IconName } from './components';
import { useTheme } from './ThemeProvider';
import type { usePhotoPicker } from './usePhotoPicker';

export function AppHeader({ onProfile }: { onProfile: () => void }) {
  const { colors, styles } = useTheme();
  return <View style={styles.heroTop}><View style={styles.brandRow}><BrandLogo />
    <View><Text style={styles.brand}>KANTRACK</Text><Text style={styles.brandSub}>CONDUCTOR</Text></View></View>
    <View style={styles.heroActions}>
      <AppIcon name="notifications-outline" size={21} color={colors.heroText} />
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={onProfile} style={styles.avatarSmall}>
        <Text style={styles.avatarSmallText}>DA</Text>
      </Pressable>
    </View></View>;
}

export function ErrorBanner({ message, retry }: { message: string; retry: () => void }) {
  const { styles } = useTheme();
  return <Pressable accessibilityRole="button" onPress={retry} style={styles.error}>
    <Text style={styles.errorText}>{message} · Toca para reintentar</Text>
  </Pressable>;
}

export function LoadingState() {
  const { colors, styles } = useTheme();
  return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /><Body>Preparando tu jornada…</Body></View>;
}

const tabs: { id: Tab; label: string; icon: IconName; selectedIcon: IconName }[] = [
  { id: 'inicio', label: 'Inicio', icon: 'home-outline', selectedIcon: 'home' },
  { id: 'viajes', label: 'Viajes', icon: 'bus-outline', selectedIcon: 'bus' },
  { id: 'mapa', label: 'Mapa', icon: 'map-outline', selectedIcon: 'map' },
  { id: 'actividad', label: 'Actividad', icon: 'stats-chart-outline', selectedIcon: 'stats-chart' },
  { id: 'perfil', label: 'Perfil', icon: 'person-outline', selectedIcon: 'person' }
];

export function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { colors, styles } = useTheme();
  return <View style={styles.nav}>{tabs.map(tab => <Pressable key={tab.id} accessibilityRole="tab"
    accessibilityState={{ selected: active === tab.id }} onPress={() => onChange(tab.id)}
    style={[styles.navItem, active === tab.id && styles.navActive]}>
    <AppIcon name={active === tab.id ? tab.selectedIcon : tab.icon} size={19} color={active === tab.id ? colors.warningInk : colors.muted} />
    <Text style={[styles.navText, active === tab.id && styles.navTextActive]}>{tab.label}</Text>
  </Pressable>)}</View>;
}

export function StatCard({ number, label, icon, tone }: { number: number; label: string; icon: IconName; tone: 'blue' | 'orange' | 'red' }) {
  const { colors, styles } = useTheme();
  const backgroundColor = tone === 'blue' ? colors.info : tone === 'orange' ? colors.warning : colors.dangerSoft;
  const iconColor = tone === 'blue' ? colors.accentBlue : tone === 'orange' ? colors.brandStrong : colors.danger;
  return <View style={styles.stat}><View style={[styles.statIcon, { backgroundColor }]}><AppIcon name={icon} size={18} color={iconColor} /></View>
    <Text style={styles.statNumber}>{number}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

export function MetricTile({ number, label, icon, tone }: { number: number; label: string; icon: IconName; tone: 'blue' | 'green' | 'orange' | 'purple' }) {
  const { colors, styles } = useTheme();
  const tint = tone === 'blue' ? colors.info : tone === 'green' ? colors.success : tone === 'orange' ? colors.warning : colors.soft;
  const accent = tone === 'blue' ? colors.accentBlue : tone === 'green' ? colors.successInk : tone === 'orange' ? colors.brandStrong : colors.neutralInk;
  return <View style={[styles.metricTile, { backgroundColor: tint }]}>
    <AppIcon name={icon} size={24} color={accent} />
    <Text style={styles.metricNumber}>{number}</Text><Text style={styles.metricLabel}>{label}</Text>
  </View>;
}

export function ActivityBarChart({ bars }: { bars: ReadonlyArray<{ label: string; value: number; today: boolean }> }) {
  const { styles } = useTheme();
  const max = Math.max(1, ...bars.map(bar => bar.value));
  return <View style={styles.chart}>{bars.map((bar, index) => <View key={`${bar.label}-${index}`} style={styles.chartColumn}>
    <View style={[styles.chartBar, bar.today && styles.chartBarToday, { height: Math.max(5, 82 * bar.value / max) }]} />
    <Text style={styles.chartLabel}>{bar.label}</Text>
  </View>)}</View>;
}

export function TripCard({ trip, onPress, onAction }: { trip: Trip; onPress: () => void; onAction?: () => void }) {
  const { colors, styles } = useTheme();
  const actionLabelText = trip.status === 'assigned' ? 'Aceptar' : trip.status === 'accepted' ? 'Iniciar' : null;
  const tone = trip.status === 'active' ? 'success' : trip.status === 'assigned' ? 'warning' : 'neutral';
  return <View style={styles.tripCard}>
    <Row><Text style={styles.tripCode}>{trip.code}</Text><Chip label={tripLabel[trip.status]} tone={tone} /></Row>
    <View style={styles.tripLine}><AppIcon name="time-outline" size={15} color={colors.muted} /><Text style={styles.tripLineText}>{trip.scheduledAt}</Text></View>
    <View style={styles.tripLine}><AppIcon name="navigate-outline" size={15} color={colors.muted} /><Text style={styles.tripCardRoute}>{trip.route}</Text></View>
    <View style={styles.tripLine}><AppIcon name="location-outline" size={15} color={colors.muted} /><Text style={styles.tripLineText}>{trip.stops.length} paradas · {trip.vehicle}</Text></View>
    <View style={styles.buttonRow}><View style={styles.flex}><Button label="Ver detalles" variant="outline" onPress={onPress} /></View>
      {actionLabelText && onAction && <View style={styles.flex}><Button label={actionLabelText} icon={trip.status === 'assigned' ? 'checkmark-circle-outline' : 'play-circle-outline'} onPress={onAction} /></View>}</View>
  </View>;
}

export function StopCard({ stop, index, onPress }: { stop: Stop; index: number; onPress: () => void }) {
  const { colors, styles } = useTheme();
  const resolved = stop.status === 'completed';
  const failed = stop.status === 'failed';
  const dotColor = resolved ? colors.successInk : failed ? colors.danger : stop.status === 'arrived' ? colors.primary : colors.border;
  const tone = resolved ? 'success' : failed ? 'danger' : stop.status === 'arrived' ? 'warning' : 'neutral';
  return <Pressable accessibilityRole="button" onPress={onPress} style={styles.stopRow}>
    <View style={[styles.stopDot, { backgroundColor: dotColor }]}><AppIcon name={resolved ? 'checkmark' : failed ? 'close' : 'ellipse'} size={resolved || failed ? 16 : 8} color={resolved || failed ? colors.heroText : colors.surface} /></View>
    <View style={styles.stopText}><Text style={styles.stopName}>{index + 1}. {stop.customer}</Text>
      <Text style={styles.stopMeta}>{stop.window} · {stop.address}</Text></View>
    <Chip label={stopLabel[stop.status]} tone={tone} />
    <AppIcon name="chevron-forward" size={16} color={colors.muted} />
  </Pressable>;
}

export function PhotoPickerButtons({ picker }: { picker: ReturnType<typeof usePhotoPicker> }) {
  const { styles } = useTheme();
  return <><Row><View style={styles.flex}><Button label="Tomar foto" variant="outline" icon="camera-outline" disabled={picker.choosing} onPress={() => { void picker.choose(true); }} /></View>
    <View style={styles.flex}><Button label="Galería" variant="outline" icon="images-outline" disabled={picker.choosing} onPress={() => { void picker.choose(false); }} /></View></Row>
    {picker.photoUri && <PhotoPreview uri={picker.photoUri} label="Foto adjunta" />}</>;
}

export function ChoiceChips<T extends string>({ options, value, onChange }: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const { styles } = useTheme();
  return <View style={styles.reportTypes}>{options.map(option => <Pressable key={option.value}
    accessibilityRole="button" accessibilityState={{ selected: value === option.value }}
    style={[styles.reportType, value === option.value && styles.reportTypeActive]}
    onPress={() => onChange(option.value)}>
    <Text style={[styles.reportTypeText, value === option.value && styles.reportTypeTextActive]}>{option.label}</Text>
  </Pressable>)}</View>;
}

export function SosButton({ pilot, activeTripId }: { pilot: Pilot; activeTripId?: string }) {
  const { styles } = useTheme();
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
    <Text style={[styles.helpText, holding && styles.helpHoldingText]}>SOS</Text>
  </Pressable></View>;
}

const actionIcons: Record<keyof typeof actionLabel, IconName> = {
  acceptTrip: 'checkmark-circle', startTrip: 'play-circle', finishTrip: 'stop-circle',
  arriveStop: 'location', completeStop: 'cube', failStop: 'alert-circle',
  fieldReport: 'document-text', sos: 'warning'
};

export function ActivityCard({ action, timestamp, conflict }: { action: keyof typeof actionLabel; timestamp: string; conflict: boolean }) {
  const { colors, styles } = useTheme();
  const date = new Date(timestamp);
  const accent = conflict ? colors.danger : action === 'sos' ? colors.danger : action === 'completeStop' ? colors.successInk : colors.accentBlue;
  return <View style={styles.activityRow}><Text style={styles.activityTime}>{date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</Text>
    <View style={[styles.activityIcon, { backgroundColor: conflict ? colors.dangerSoft : colors.info }]}><AppIcon name={actionIcons[action]} size={17} color={accent} /></View>
    <View style={styles.activityText}><Text style={styles.activityTitle}>{actionLabel[action]}</Text>
      <Text style={styles.activityMeta}>{conflict ? 'Conflicto local' : 'Guardado en este dispositivo'}</Text></View>
  </View>;
}
