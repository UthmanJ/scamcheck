import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme/useTheme'
import { risk } from '../theme/colors'

export default function ScoreCard({ result }) {
  const { colors } = useTheme()
  const color = risk[result.level]

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <View style={styles.top}>
        <View style={[styles.ring, { borderColor: color }]}>
          <Text style={[styles.score, { color }]}>{result.score}</Text>
          <Text style={[styles.outOf, { color: colors.mute }]}>/ 100</Text>
        </View>
        <View style={styles.text}>
          <Text style={[styles.label, { color }]}>{result.label}</Text>
          <Text style={[styles.summary, { color: colors.mute }]}>{result.summary}</Text>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: colors.line }]}>
        <View style={[styles.fill, { width: `${Math.max(result.score, 3)}%`, backgroundColor: color }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 24 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ring: { width: 88, height: 88, borderRadius: 44, borderWidth: 6, alignItems: 'center', justifyContent: 'center' },
  score: { fontSize: 28, fontWeight: '800', lineHeight: 30 },
  outOf: { fontSize: 10 },
  text: { flex: 1 },
  label: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  summary: { fontSize: 14, lineHeight: 20 },
  track: { height: 8, borderRadius: 4, marginTop: 18, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
})