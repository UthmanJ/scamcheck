// Run with:  npx tsx src/utils/scamEngine.test.js
import { analyzeMessage, extractUrls } from './scamEngine.js'

const ORDER = ['low', 'medium', 'high', 'critical']

// [message, lowest acceptable level, highest acceptable level]
const cases = [
  ['https://gtbank.com/', 'low', 'low'],
  ['https://www.google.com/search?q=hi', 'low', 'low'],
  ['https://paystack.com/pricing', 'low', 'low'],
  ['https://jamb.gov.ng/results', 'low', 'low'],
  ['Hey, are we still meeting at 5pm? Check www.bbc.co.uk', 'low', 'low'],
  ['https://bit.ly/3xYz', 'medium', 'medium'],
  ['Please send me your OTP to confirm the transfer', 'medium', 'high'],
  ['http://gtbank-secure-login.com/verify', 'high', 'critical'],
  ['https://paypa1.com/signin', 'high', 'critical'],
  ['http://192.168.4.7/bank/login', 'high', 'critical'],
  ['https://gtbank.com.verify-now.xyz/otp', 'critical', 'critical'],
  ['Congratulations you won! Pay N5,000 processing fee to claim your prize', 'high', 'critical'],
  ['Dear customer your account will be suspended within 24 hours. Verify your BVN now: http://gtb-update.top/login', 'critical', 'critical'],
]

let failed = 0
for (const [text, min, max] of cases) {
  const r = analyzeMessage(text)
  const i = ORDER.indexOf(r.level)
  const ok = i >= ORDER.indexOf(min) && i <= ORDER.indexOf(max)
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${String(r.score).padStart(3)}  ${r.level.padEnd(8)}  ${text.slice(0, 60)}`)
}

console.log('\nLinks found:', extractUrls('Visit www.example.com. Or http://a.b/c?d=1, and bit.ly/xx'))
console.log(failed ? `\n${failed} test(s) failed` : '\nAll tests passed')
