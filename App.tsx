import { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { usePilot } from './src/application/usePilot';
import { BottomTabs, ErrorBanner, LoadingState, SosButton } from './src/ui/widgets';
import { ThemeProvider, useTheme } from './src/ui/ThemeProvider';
import type { Tab } from './src/ui/types';
import { HomeScreen } from './src/ui/screens/HomeScreen';
import { TripsScreen } from './src/ui/screens/TripsScreen';
import { TripDetailScreen } from './src/ui/screens/TripDetailScreen';
import { StopDetailScreen } from './src/ui/screens/StopDetailScreen';
import { FieldReportsScreen } from './src/ui/screens/FieldReportsScreen';
import { ActivityScreen } from './src/ui/screens/ActivityScreen';
import { ProfileScreen } from './src/ui/screens/ProfileScreen';
import { MetricsScreen } from './src/ui/screens/MetricsScreen';
import { MapScreen } from './src/ui/screens/MapScreen';

function AppContent() {
  const { colors, styles, mode } = useTheme();
  const pilot = usePilot();
  const [tab, setTab] = useState<Tab>('inicio');
  const [tripId, setTripId] = useState<string | null>(null);
  const [stopId, setStopId] = useState<string | null>(null);
  const [mapTripId, setMapTripId] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const trip = pilot.trips.find(item => item.id === tripId);
  const stop = trip?.stops.find(item => item.id === stopId);
  const activeTrip = pilot.trips.find(item => item.status === 'active');
  const mapTrip = pilot.trips.find(item => item.id === mapTripId) ?? activeTrip ?? pilot.trips.find(item => item.status === 'accepted') ?? pilot.trips[0];
  const homeTop = tab === 'inicio' && !showMetrics && !pilot.loading;

  const openTrip = (id: string) => { setTripId(id); setStopId(null); setShowReports(false); setShowMetrics(false); setTab('viajes'); };
  const changeTab = (next: Tab) => { setTab(next); setTripId(null); setStopId(null); setMapTripId(null); setShowMetrics(false); setShowReports(false); };
  const openMap = (id: string) => { setMapTripId(id); setTripId(null); setStopId(null); setTab('mapa'); };
  const openReports = () => { setShowReports(true); setShowMetrics(false); setTripId(null); setStopId(null); setTab('mapa'); };

  return <SafeAreaView style={[styles.app, homeTop && { backgroundColor: colors.hero }]} edges={['top']}>
    <StatusBar barStyle={homeTop || mode === 'dark' ? 'light-content' : 'dark-content'} />
    {pilot.error && <ErrorBanner message={pilot.error} retry={() => { void pilot.reload(); }} />}
    {pilot.loading ? <LoadingState /> :
      <View style={styles.content}>
        {tab === 'inicio' && (showMetrics ? <MetricsScreen pilot={pilot} back={() => setShowMetrics(false)} /> :
          <HomeScreen pilot={pilot} openTrip={openTrip} goTrips={() => changeTab('viajes')}
            goMetrics={() => setShowMetrics(true)} goProfile={() => changeTab('perfil')} />)}
        {tab === 'viajes' && stop && trip ? <StopDetailScreen key={stop.id} trip={trip} stop={stop} pilot={pilot} back={() => setStopId(null)} />
          : tab === 'viajes' && trip ? <TripDetailScreen trip={trip} pilot={pilot} back={() => setTripId(null)} openStop={setStopId} openMap={() => openMap(trip.id)} />
          : tab === 'viajes' && <TripsScreen pilot={pilot} openTrip={openTrip} />}
        {tab === 'mapa' && (showReports ? <FieldReportsScreen pilot={pilot} back={() => setShowReports(false)} /> :
          <MapScreen trip={mapTrip} openTrip={() => { if (mapTrip) openTrip(mapTrip.id); }} openReports={openReports} goTrips={() => changeTab('viajes')} />)}
        {tab === 'actividad' && <ActivityScreen pilot={pilot} />}
        {tab === 'perfil' && <ProfileScreen pilot={pilot} openReports={openReports} />}
      </View>}
    <SosButton pilot={pilot} activeTripId={activeTrip?.id} />
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.topbar }}>
      <BottomTabs active={tab} onChange={changeTab} />
    </SafeAreaView>
  </SafeAreaView>;
}

export default function App() { return <SafeAreaProvider><ThemeProvider><AppContent /></ThemeProvider></SafeAreaProvider>; }
