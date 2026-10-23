import type { PropsWithChildren } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { styles } from './theme';

export function Screen({ children, keyboard = false }: PropsWithChildren<{ keyboard?: boolean }>) {
  return <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps={keyboard ? 'handled' : 'never'}>{children}</ScrollView>;
}

export function Eyebrow({ children }: PropsWithChildren) { return <Text style={styles.eyebrow}>{children}</Text>; }
export function Heading({ children }: PropsWithChildren) { return <Text style={styles.heading}>{children}</Text>; }
export function Subtitle({ children }: PropsWithChildren) { return <Text style={styles.subtitle}>{children}</Text>; }
export function SectionTitle({ children }: PropsWithChildren) { return <Text style={styles.sectionTitle}>{children}</Text>; }
export function CardTitle({ children }: PropsWithChildren) { return <Text style={styles.cardTitle}>{children}</Text>; }
export function Body({ children }: PropsWithChildren) { return <Text style={styles.body}>{children}</Text>; }
export function Hint({ children }: PropsWithChildren) { return <Text style={styles.hint}>{children}</Text>; }
export function InfoTitle({ children }: PropsWithChildren) { return <Text style={styles.infoTitle}>{children}</Text>; }
export function LinkText({ children }: PropsWithChildren) { return <Text style={styles.link}>{children}</Text>; }
export function Spacer({ small = false }: { small?: boolean }) { return <View style={small ? styles.smallSpace : styles.space} />; }
export function Divider() { return <View style={styles.divider} />; }
export function Row({ children }: PropsWithChildren) { return <View style={styles.row}>{children}</View>; }

export function Panel({ children, onPress }: PropsWithChildren<{ onPress?: () => void }>) {
  if (onPress) return <Pressable accessibilityRole="button" onPress={onPress} style={styles.panel}>{children}</Pressable>;
  return <View style={styles.panel}>{children}</View>;
}

export function InfoPanel({ title, children }: PropsWithChildren<{ title?: string }>) {
  return <View style={styles.infoCard}>{title && <InfoTitle>{title}</InfoTitle>}<Body>{children}</Body></View>;
}

export function Notice({ title, children }: PropsWithChildren<{ title: string }>) {
  return <View style={styles.notice}><Text style={styles.noticeTitle}>{title}</Text><Text style={styles.noticeBody}>{children}</Text></View>;
}

export function Button({ label, onPress, variant = 'primary', disabled = false }: {
  label: string; onPress: () => void; variant?: 'primary' | 'outline' | 'danger'; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[styles.button, variant === 'outline' && styles.buttonOutline, variant === 'danger' && styles.buttonDanger, disabled && styles.disabled]}>
    <Text style={[styles.buttonText, variant === 'outline' && styles.buttonOutlineText]}>{label}</Text>
  </Pressable>;
}

export function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' }) {
  return <View style={[styles.chip, tone === 'success' && styles.chipSuccess, tone === 'warning' && styles.chipWarning]}><Text style={styles.chipText}>{label}</Text></View>;
}

export function FieldInput(props: TextInputProps) {
  return <TextInput {...props} style={[styles.input, props.style]} />;
}

export function PhotoPreview({ uri, label }: { uri: string; label: string }) {
  return <Image source={{ uri }} style={styles.preview} accessibilityLabel={label} />;
}

export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress}><LinkText>‹ {label}</LinkText></Pressable>;
}
