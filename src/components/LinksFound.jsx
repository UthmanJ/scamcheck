import { Platform, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme/useTheme'
import { risk } from '../theme/colors'
import { levelFor } from '../utils/scamEngine'

const mono = Platform.select({ ios: 'Menlo', default: 'monospace' })

export default function LinksFound({ urls }) {
  const { colors } = useTheme()

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.mute }]}>LINKS FOUND ({urls.length})</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
        {urls.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mute }]}>No links found in this message.</Text>
        ) : (
          urls.map((u, i) => (
            <View key={u.url} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
              <Text style={[styles.host, { color: colors.text, fontFamily: mono }]} numberOfLines={2}>{u.url}</Text>
              <Text style={[styles.score, { color: risk[levelFor(u.score)] }]}>{u.score}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  heading: { fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
  empty: { paddingVertical: 16, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  host: { flex: 1, fontSize: 12 },
  score: { fontSize: 16, fontWeight: '800' },
})