import { useEffect, useState } from 'react'
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import ScreenShell from '../components/ScreenShell'
import ScoreCard from '../components/ScoreCard'
import FlagList from '../components/FlagList'
import LinksFound from '../components/LinksFound'
import { useTheme } from '../theme/useTheme'
import { analyzeMessage } from '../utils/scamEngine'
import { useHistory } from '../context/HistoryContext'

const EXAMPLES = [
  { name: 'Fake bank alert', text: 'Dear customer, your account will be suspended within 24 hours. Verify your BVN now: http://gtb-update.top/login' },
  { name: 'Prize message', text: 'Congratulations! You have won N500,000. Pay a N5,000 processing fee to claim your prize.' },
  { name: 'Normal link', text: 'https://paystack.com/pricing' },
]

export default function CheckScreen({ route }) {
  const { colors } = useTheme()
  const { add } = useHistory()
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [notice, setNotice] = useState('')

  const edit = (value) => {
    setText(value)
    setResult(null)
    setNotice('')
  }

  useEffect(() => {
    const prefill = route?.params?.prefill
    if (prefill) {
      setText(prefill)
      setNotice('')
      setResult(analyzeMessage(prefill))
    }
  }, [route?.params?.stamp])

  const check = () => {
    if (!text.trim()) {
      setResult(null)
      setNotice('Paste a link or message first.')
      return
    }
    Keyboard.dismiss()
    setNotice('')
    const r = analyzeMessage(text)
    setResult(r)
    add(text, r)
  }

  const paste = async () => {
    const value = await Clipboard.getStringAsync()
    if (value) edit(value)
    else setNotice('Your clipboard is empty.')
  }

  return (
    <ScreenShell label="01 — CHECK" title="Check a message" subtitle="Paste a link or a whole SMS or WhatsApp message and see how risky it looks.">
      <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.line }]}>
        <TextInput
          value={text}
          onChangeText={edit}
          multiline
          placeholder="Paste a link or message here"
          placeholderTextColor={colors.mute}
          style={[styles.input, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.tools}>
          <Pressable onPress={paste} hitSlop={8}>
            <Text style={[styles.tool, { color: colors.accent }]}>Paste</Text>
          </Pressable>
          {text.length > 0 && (
            <Pressable onPress={() => edit('')} hitSlop={8}>
              <Text style={[styles.tool, { color: colors.mute }]}>Clear</Text>
            </Pressable>
          )}
        </View>
      </View>

      {notice ? <Text style={[styles.notice, { color: colors.mute }]}>{notice}</Text> : null}

      <Pressable onPress={check} style={({ pressed }) => [styles.button, { backgroundColor: colors.text, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={[styles.buttonText, { color: colors.bg }]}>Check it</Text>
      </Pressable>

      <Text style={[styles.heading, { color: colors.mute }]}>TRY AN EXAMPLE</Text>
      <View style={styles.chips}>
        {EXAMPLES.map((e) => (
          <Pressable key={e.name} onPress={() => edit(e.text)} style={[styles.chip, { borderColor: colors.line, backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontSize: 13 }}>{e.name}</Text>
          </Pressable>
        ))}
      </View>

      {result && (
        <>
          <ScoreCard result={result} />
          <FlagList result={result} />
          <LinksFound urls={result.urls} />
          <Text style={[styles.privacy, { color: colors.mute }]}>Checked on your phone. Nothing you paste is sent anywhere.</Text>
        </>
      )}
    </ScreenShell>
  )
}

const styles = StyleSheet.create({
  inputCard: { borderWidth: 1, borderRadius: 16, padding: 14 },
  input: { minHeight: 130, fontSize: 16, lineHeight: 23, textAlignVertical: 'top' },
  tools: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, paddingTop: 8 },
  tool: { fontSize: 14, fontWeight: '700' },
  notice: { marginTop: 10, fontSize: 14 },
  button: { marginTop: 16, borderRadius: 999, paddingVertical: 15, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  heading: { fontSize: 12, letterSpacing: 2, marginTop: 26, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  privacy: { fontSize: 12, textAlign: 'center', marginTop: 24 },
})