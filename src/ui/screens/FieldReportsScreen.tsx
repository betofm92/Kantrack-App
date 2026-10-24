import { useState } from 'react';
import { Alert, View } from 'react-native';
import type { Pilot } from '../types';
import { Button, Eyebrow, FieldInput, Heading, InfoPanel, Screen, ScreenHeader, SectionTitle, Subtitle } from '../components';
import { ChoiceChips, PhotoPickerButtons } from '../widgets';
import { usePhotoPicker } from '../usePhotoPicker';
import { useTheme } from '../ThemeProvider';

type ReportType = 'fuel' | 'expense' | 'incident' | 'inspection';
const choices: { value: ReportType; label: string }[] = [
  { value: 'fuel', label: 'Combustible' }, { value: 'expense', label: 'Gasto' },
  { value: 'incident', label: 'Incidencia' }, { value: 'inspection', label: 'Inspección' }
];

export function FieldReportsScreen({ pilot, back }: { pilot: Pilot; back: () => void }) {
  const { styles } = useTheme();
  const [type, setType] = useState<ReportType>('incident');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [odometer, setOdometer] = useState('');
  const picker = usePhotoPicker();

  const save = async () => {
    const ok = await pilot.dispatch({
      kind: 'fieldReport', reportType: type, description: description.trim(),
      amount: type === 'fuel' || type === 'expense' ? Number(amount.replace(',', '.')) : undefined,
      odometer: type === 'fuel' ? Number(odometer.replace(',', '.')) : undefined,
      photoUri: picker.photoUri
    });
    if (ok) {
      setDescription(''); setAmount(''); setOdometer(''); picker.clear();
      Alert.alert('Reporte guardado', 'El reporte solo está en este dispositivo.');
    }
  };

  return <Screen keyboard>
    <ScreenHeader title="Reporte de campo" onBack={back} />
    <Eyebrow>OPERACIÓN EN CAMPO</Eyebrow><Heading>Reportes</Heading>
    <Subtitle>Registra eventos de tu jornada. Todo queda local en el modo demo.</Subtitle>
    <ChoiceChips options={choices} value={type} onChange={setType} />
    <SectionTitle>Nuevo reporte · {choices.find(choice => choice.value === type)?.label}</SectionTitle>
    <FieldInput multiline placeholder={type === 'inspection' ? 'Resultado y defectos encontrados' : 'Describe lo ocurrido'} accessibilityLabel="Descripción del reporte" value={description} onChangeText={setDescription} />
    {(type === 'fuel' || type === 'expense') && <FieldInput placeholder="Valor" accessibilityLabel="Valor" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />}
    {type === 'fuel' && <FieldInput placeholder="Odómetro (km)" accessibilityLabel="Odómetro en kilómetros" keyboardType="decimal-pad" value={odometer} onChangeText={setOdometer} />}
    <PhotoPickerButtons picker={picker} />
    <View style={styles.actionBlock}><Button label="Guardar reporte local" onPress={() => { void save(); }} /></View>
    <InfoPanel>Los formularios y códigos de validación definitivos dependen del contrato de CONNECT.</InfoPanel>
  </Screen>;
}
