import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

function Block({ title, items, colors }) {
  return (
    <View style={styles.block}>
      <Text style={[styles.blockTitle, { color: colors.mute }]}>{title}</Text>
      {items.map((t) => (
        <View key={t} style={styles.bullet}>
          <Text style={{ color: colors.accent, fontWeight: '800' }}>•</Text>
          <Text style={[styles.bulletText, { color: colors.text }]}>{t}</Text>
        </View>
      ))}
    </View>
  )
}

export default function TipCard({ tip, onTest }) {
  const { colors } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.line }]}>
      <Pressable onPress={() => setOpen((o) => !o)} style={styles.head}>
        <View style={[styles.icon, { borderColor: colors.line, backgroundColor: colors.bg }]}>
          <Ionicons name={tip.icon} size={20} color={colors.text} />
        </View>
        <View style={styles.headText}>
          <Text style={[styles.title, { color: colors.text }]}>{tip.title}</Text>
          <Text style={[styles.summary, { color: colors.mute }]}>{tip.summary}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mute} />
      </Pressable>

      {open && (
        <View style={[styles.body, { borderTopColor: colors.line }]}>
          <Text style={[styles.blockTitle, { color: colors.mute }]}>HOW IT WORKS</Text>
          <Text style={[styles.how, { color: colors.text }]}>{tip.how}</Text>
          <Block title="WARNING SIGNS" items={tip.signs} colors={colors} />
          <Block title="WHAT TO DO" items={tip.todo} colors={colors} />
          {tip.example ? (
            <Pressable onPress={() => onTest(tip.example)} style={[styles.test, { borderColor: colors.accent }]}>
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 14 }}>Test an example in the checker</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  icon: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  summary: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  body: { borderTopWidth: 1, padding: 16 },
  blockTitle: { fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  how: { fontSize: 14, lineHeight: 21 },
  block: { marginTop: 16 },
  bullet: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  test: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 11, alignItems: 'center', marginTop: 18 },
})