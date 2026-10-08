import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme/useTheme'
import { risk } from '../theme/colors'

export default function FlagList({ result }) {
  const { colors } = useTheme()
  const color = risk[result.level]

  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.mute }]}>WHY THIS SCORE</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
        {result.flags.length === 0 ? (
          <Text style={[styles.empty, { color: colors.mute }]}>No specific warning signs were found in this message.</Text>
        ) : (
          result.flags.map((f, i) => (
            <View key={f.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
              <View style={styles.rowText}>
                <Text style={[styles.title, { color: colors.text }]}>{f.label}</Text>
                <Text style={[styles.detail, { color: colors.mute }]}>{f.detail}</Text>
              </View>
              <Text style={[styles.points, { color }]}>+{f.points}</Text>
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
  row: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
  rowText: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  detail: { fontSize: 13, lineHeight: 19 },
  points: { fontSize: 14, fontWeight: '800' },
})