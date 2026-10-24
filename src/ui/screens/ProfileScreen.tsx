import { Alert, Pressable, Switch, Text, View } from 'react-native';
import type { Pilot } from '../types';
import { AppIcon, Body, Button, Chip, InfoPanel, Screen, SectionTitle } from '../components';
import { useTheme } from '../ThemeProvider';

export function ProfileScreen({ pilot, openReports }: { pilot: Pilot; openReports: () => void }) {
  const { colors, styles, mode, setMode } = useTheme();
  const confirmReset = () => Alert.alert('Reiniciar demostración', 'Se borrarán las acciones guardadas localmente.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Reiniciar', style: 'destructive', onPress: () => { void pilot.reset(); } }
  ]);
  return <Screen>
    <Text style={styles.heading}>Mi perfil</Text>
    <View style={styles.profileCard}>
      <View style={styles.avatar}><Text style={styles.avatarText}>DA</Text></View>
      <View style={styles.flex}><Text style={styles.profileName}>Conductor Demo</Text>
        <Text style={styles.profileEmail}>Cuenta de demostración · demo-bogota</Text>
        <View style={styles.smallSpace} /><Chip label="Demo activa" tone="success" /></View>
    </View>
    <SectionTitle>Mi información</SectionTitle>
    <View style={styles.profileRow}><AppIcon name="person-outline" size={20} color={colors.muted} />
      <Text style={styles.profileRowText}>Identificador</Text><Text style={styles.profileRowValue}>demo-conductor</Text></View>
    <View style={styles.profileRow}><AppIcon name="bus-outline" size={20} color={colors.muted} />
      <Text style={styles.profileRowText}>Vehículo asignado</Text><Text style={styles.profileRowValue}>Van 12 · KTW 418</Text></View>
    <View style={styles.profileRow}><AppIcon name="cloud-offline-outline" size={20} color={colors.muted} />
      <Text style={styles.profileRowText}>Acciones locales</Text><Text style={styles.profileRowValue}>{pilot.pending.length}</Text></View>
    <SectionTitle>Preferencias y operación</SectionTitle>
    <View style={styles.profileRow}><AppIcon name="moon-outline" size={20} color={colors.muted} />
      <Text style={styles.profileRowText}>Modo oscuro</Text>
      <Switch accessibilityLabel="Modo oscuro" value={mode === 'dark'} onValueChange={enabled => setMode(enabled ? 'dark' : 'light')}
        trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.surface} /></View>
    <Pressable accessibilityRole="button" onPress={openReports} style={styles.profileRow}>
      <AppIcon name="document-text-outline" size={20} color={colors.muted} /><Text style={styles.profileRowText}>Reportes de campo</Text>
      <AppIcon name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
    <InfoPanel title="Conexión al backend">No conectada. El contrato de autenticación, viajes, turnos, POD y SOS está pendiente.</InfoPanel>
    <View style={styles.actionBlock}><Button label="Reiniciar datos de demostración" variant="outline" icon="refresh-outline" onPress={confirmReset} /></View>
    <Body>El modo oscuro se guarda en este dispositivo.</Body>
  </Screen>;
}
