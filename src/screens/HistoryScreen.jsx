import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import ScreenShell from '../components/ScreenShell'
import { useTheme } from '../theme/useTheme'
import { risk } from '../theme/colors'
import { useHistory } from '../context/HistoryContext'
import { LEVELS } from '../utils/scamEngine'
import { timeAgo } from '../utils/timeAgo'

export default function HistoryScreen({ navigation }) {
  const { colors } = useTheme()
  const { items, loaded, remove, clear } = useHistory()

  const confirmClear = () =>
    Alert.alert('Clear all checks?', 'This removes every saved check from this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: clear },
    ])

  const open = (item) => navigation.navigate('Check', { prefill: item.text, stamp: Date.now() })

  return (
    <ScreenShell label="02 — HISTORY" title="Past checks" subtitle="Everything you've checked, saved on this phone only.">
      {loaded && items.length === 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
          <Text style={{ color: colors.mute, fontSize: 15, lineHeight: 22 }}>
            No checks yet. Check a message on the first tab and it will show up here.
          </Text>
        </View>
      )}

      {items.length > 0 && (
        <View style={styles.headerRow}>
          <Text style={[styles.count, { color: colors.mute }]}>{items.length} SAVED</Text>
          <Pressable onPress={confirmClear} hitSlop={8}>
            <Text style={{ color: risk.critical, fontWeight: '700', fontSize: 14 }}>Clear all</Text>
          </Pressable>
        </View>
      )}

      {items.map((item) => {
        const color = risk[item.level]
        return (
          <Pressable key={item.id} onPress={() => open(item)} style={[styles.card, styles.item, { backgroundColor: colors.card, borderColor: colors.line }]}>
            <View style={styles.top}>
              <View style={[styles.pill, { borderColor: color }]}>
                <Text style={{ color, fontWeight: '800', fontSize: 12 }}>
                  {item.score} · {LEVELS[item.level].label}
                </Text>
              </View>
              <Text style={{ color: colors.mute, fontSize: 12 }}>{timeAgo(item.createdAt)}</Text>
            </View>
            <Text numberOfLines={2} style={{ color: colors.text, fontSize: 15, lineHeight: 21, marginTop: 10 }}>
              {item.text}
            </Text>
            <View style={styles.bottom}>
              <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '700' }}>Open</Text>
              <Pressable onPress={() => remove(item.id)} hitSlop={10}>
                <Text style={{ color: colors.mute, fontSize: 13, fontWeight: '700' }}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        )
      })}
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 18 },
  item: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  count: { fontSize: 12, letterSpacing: 2 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
})