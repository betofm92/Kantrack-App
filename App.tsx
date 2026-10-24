import { useState } from 'react';
import { StatusBar, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { usePilot } from './src/application/usePilot';
import { AppHeader, BottomTabs, ErrorBanner, LoadingState, SosButton } from './src/ui/widgets';
import { styles } from './src/ui/theme';
import type { Tab } from './src/ui/types';
import { HomeScreen } from './src/ui/screens/HomeScreen';
import { TripsScreen } from './src/ui/screens/TripsScreen';
import { TripDetailScreen } from './src/ui/screens/TripDetailScreen';
import { StopDetailScreen } from './src/ui/screens/StopDetailScreen';
import { FieldReportsScreen } from './src/ui/screens/FieldReportsScreen';
import { ActivityScreen } from './src/ui/screens/ActivityScreen';
import { ProfileScreen } from './src/ui/screens/ProfileScreen';

function AppContent() {
  const pilot = usePilot();
  const [tab, setTab] = useState<Tab>('inicio');
  const [tripId, setTripId] = useState<string | null>(null);
  const [stopId, setStopId] = useState<string | null>(null);
  const trip = pilot.trips.find(item => item.id === tripId);
  const stop = trip?.stops.find(item => item.id === stopId);
  const activeTrip = pilot.trips.find(item => item.status === 'active');

  const openTrip = (id: string) => { setTripId(id); setStopId(null); setTab('viajes'); };
  const changeTab = (next: Tab) => { setTab(next); setTripId(null); setStopId(null); };

  return <SafeAreaView style={styles.app} edges={['top', 'bottom']}>
    <StatusBar barStyle="dark-content" />
    <AppHeader />
    {pilot.error && <ErrorBanner message={pilot.error} retry={() => { void pilot.reload(); }} />}
    {pilot.loading ? <LoadingState /> :
      <View style={styles.content}>
        {tab === 'inicio' && <HomeScreen pilot={pilot} openTrip={openTrip} goTrips={() => changeTab('viajes')} />}
        {tab === 'viajes' && stop && trip ? <StopDetailScreen key={stop.id} trip={trip} stop={stop} pilot={pilot} back={() => setStopId(null)} />
          : tab === 'viajes' && trip ? <TripDetailScreen trip={trip} pilot={pilot} back={() => setTripId(null)} openStop={setStopId} />
          : tab === 'viajes' && <TripsScreen pilot={pilot} openTrip={openTrip} />}
        {tab === 'campo' && <FieldReportsScreen pilot={pilot} />}
        {tab === 'actividad' && <ActivityScreen pilot={pilot} />}
        {tab === 'perfil' && <ProfileScreen pilot={pilot} />}
      </View>}
    <SosButton pilot={pilot} activeTripId={activeTrip?.id} />
    <BottomTabs active={tab} onChange={changeTab} />
  </SafeAreaView>;
}

export default function App() { return <SafeAreaProvider><AppContent /></SafeAreaProvider>; }
