import type { ComponentProps, PropsWithChildren } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from './ThemeProvider';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function AppIcon({ name, size = 19, color }: { name: IconName; size?: number; color?: string }) {
  const { colors } = useTheme();
  return <Ionicons name={name} size={size} color={color ?? colors.ink} />;
}

export function BrandLogo() {
  const { styles } = useTheme();
  return <View style={styles.brandLogoFrame} accessible={false}>
    <Image source={require('../../assets/brand/kantrack-mark.png')} style={styles.brandLogoImage} resizeMode="contain" />
  </View>;
}

export function Screen({ children, keyboard = false }: PropsWithChildren<{ keyboard?: boolean }>) {
  const { styles } = useTheme();
  return <ScrollView style={styles.content} contentContainerStyle={styles.screen}
    keyboardShouldPersistTaps={keyboard ? 'handled' : 'never'}>{children}</ScrollView>;
}

export function Eyebrow({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.eyebrow}>{children}</Text>; }
export function Heading({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.heading}>{children}</Text>; }
export function Subtitle({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.subtitle}>{children}</Text>; }
export function CardTitle({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.cardTitle}>{children}</Text>; }
export function Body({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.body}>{children}</Text>; }
export function Hint({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.hint}>{children}</Text>; }
export function InfoTitle({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.infoTitle}>{children}</Text>; }
export function LinkText({ children }: PropsWithChildren) { const { styles } = useTheme(); return <Text style={styles.link}>{children}</Text>; }
export function Spacer({ small = false }: { small?: boolean }) { const { styles } = useTheme(); return <View style={small ? styles.smallSpace : styles.space} />; }
export function Divider() { const { styles } = useTheme(); return <View style={styles.divider} />; }
export function Row({ children }: PropsWithChildren) { const { styles } = useTheme(); return <View style={styles.row}>{children}</View>; }

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { styles } = useTheme();
  return <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{title}</Text>
    {action && onAction && <Pressable accessibilityRole="button" onPress={onAction}>
      <Text style={styles.sectionAction}>{action}  ›</Text>
    </Pressable>}</View>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  const { styles } = useTheme();
  return <View style={styles.sectionRow}><Text style={styles.sectionTitle}>{children}</Text></View>;
}

export function ScreenHeader({ title, onBack, actionIcon, onAction }: {
  title: string; onBack?: () => void; actionIcon?: IconName; onAction?: () => void;
}) {
  const { styles } = useTheme();
  return <View style={styles.topBar}>
    {onBack ? <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={onBack} style={styles.iconButton}>
      <AppIcon name="chevron-back" size={24} />
    </Pressable> : <View style={styles.iconButton} />}
    <Text style={styles.topBarTitle}>{title}</Text>
    {onAction && actionIcon ? <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onAction} style={styles.iconButton}>
      <AppIcon name={actionIcon} size={21} />
    </Pressable> : <View style={styles.iconButton} />}
  </View>;
}

export function Panel({ children, onPress }: PropsWithChildren<{ onPress?: () => void }>) {
  const { styles } = useTheme();
  if (onPress) return <Pressable accessibilityRole="button" onPress={onPress} style={styles.panel}>{children}</Pressable>;
  return <View style={styles.panel}>{children}</View>;
}

export function InfoPanel({ title, children }: PropsWithChildren<{ title?: string }>) {
  const { styles } = useTheme();
  return <View style={styles.infoCard}>{title && <InfoTitle>{title}</InfoTitle>}<Body>{children}</Body></View>;
}

export function Notice({ title, children }: PropsWithChildren<{ title: string }>) {
  const { colors, styles } = useTheme();
  return <View style={styles.notice}><View style={styles.noticeIcon}><AppIcon name="information-circle-outline" size={20} color={colors.warningInk} /></View>
    <View style={styles.noticeTextBlock}><Text style={styles.noticeTitle}>{title}</Text><Text style={styles.noticeBody}>{children}</Text></View></View>;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, icon }: {
  label: string; onPress: () => void; variant?: 'primary' | 'outline' | 'dark' | 'danger'; disabled?: boolean; icon?: IconName;
}) {
  const { colors, styles } = useTheme();
  const textStyle = variant === 'outline' ? styles.buttonOutlineText : variant === 'dark' ? styles.buttonDarkText : variant === 'danger' ? styles.buttonDangerText : null;
  const iconColor = variant === 'outline' ? colors.ink : variant === 'dark' ? colors.heroText : variant === 'danger' ? colors.danger : colors.brandButtonInk;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={[styles.button, variant === 'outline' && styles.buttonOutline, variant === 'dark' && styles.buttonDark, variant === 'danger' && styles.buttonDanger, disabled && styles.disabled]}>
    {icon && <AppIcon name={icon} size={16} color={iconColor} />}
    <Text style={[styles.buttonText, textStyle]}>{label}</Text>
  </Pressable>;
}

export function Chip({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  const { styles } = useTheme();
  return <View style={[styles.chip, tone === 'success' && styles.chipSuccess, tone === 'warning' && styles.chipWarning, tone === 'danger' && styles.chipDanger]}>
    <Text style={[styles.chipText, tone === 'success' && styles.chipSuccessText, tone === 'warning' && styles.chipWarningText, tone === 'danger' && styles.chipDangerText]}>{label}</Text>
  </View>;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const { styles } = useTheme();
  return <View style={styles.segment}>{options.map(option => <Pressable key={option.value} accessibilityRole="tab"
    accessibilityState={{ selected: value === option.value }} style={[styles.segmentItem, value === option.value && styles.segmentActive]}
    onPress={() => onChange(option.value)}><Text style={[styles.segmentText, value === option.value && styles.segmentTextActive]}>{option.label}</Text></Pressable>)}</View>;
}

export function FieldInput(props: TextInputProps) {
  const { colors, styles } = useTheme();
  return <TextInput {...props} placeholderTextColor={colors.muted} selectionColor={colors.primary} style={[styles.input, props.style]} />;
}

export function PhotoPreview({ uri, label }: { uri: string; label: string }) {
  const { styles } = useTheme();
  return <Image source={{ uri }} style={styles.preview} accessibilityLabel={label} />;
}

export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress}><LinkText>‹ {label}</LinkText></Pressable>;
}
