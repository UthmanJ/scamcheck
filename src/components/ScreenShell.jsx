import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../theme/useTheme'

export default function ScreenShell({ label, title, subtitle, children }) {
  const { colors } = useTheme()

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: colors.mute }]}>{label}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.sub, { color: colors.mute }]}>{subtitle}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  body: { padding: 24, paddingBottom: 48 },
  label: { fontSize: 12, letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  sub: { fontSize: 16, lineHeight: 24, marginTop: 8, marginBottom: 20 },
})