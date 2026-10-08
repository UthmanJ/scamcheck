import { StyleSheet, Text, View } from 'react-native'
import ScreenShell from '../components/ScreenShell'
import TipCard from '../components/TipCard'
import { useTheme } from '../theme/useTheme'
import { RULES, TIPS } from '../data/tips'

export default function TipsScreen({ navigation }) {
  const { colors } = useTheme()
  const test = (text) => navigation.navigate('Check', { prefill: text, stamp: Date.now() })

  return (
    <ScreenShell label="03 — TIPS" title="Spot a scam" subtitle="Short guides to the scams people actually fall for.">
      <Text style={[styles.heading, { color: colors.mute }]}>FOUR RULES THAT STOP MOST SCAMS</Text>
      <View style={[styles.rules, { backgroundColor: colors.card, borderColor: colors.line }]}>
        {RULES.map(([title, text], i) => (
          <View key={title} style={[styles.rule, i > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
            <Text style={[styles.num, { color: colors.accent }]}>{i + 1}</Text>
            <View style={styles.ruleText}>
              <Text style={[styles.ruleTitle, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.ruleBody, { color: colors.mute }]}>{text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.heading, { color: colors.mute, marginTop: 28 }]}>COMMON SCAMS</Text>
      {TIPS.map((tip) => (
        <TipCard key={tip.id} tip={tip} onTest={test} />
      ))}
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  heading: { fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  rules: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 },
  rule: { flexDirection: 'row', gap: 14, paddingVertical: 14 },
  num: { fontSize: 22, fontWeight: '800', width: 22 },
  ruleText: { flex: 1 },
  ruleTitle: { fontSize: 15, fontWeight: '700' },
  ruleBody: { fontSize: 13, lineHeight: 19, marginTop: 2 },
})