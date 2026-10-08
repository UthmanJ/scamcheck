// ScamCheck scoring engine: plain JavaScript, no React Native code in here.
// Weights are starting values. Tune them as you test real messages.

const SUSPICIOUS_TLDS = ['xyz', 'top', 'click', 'link', 'icu', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'rest', 'zip', 'mov', 'cyou', 'buzz', 'sbs', 'cfd']
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'rb.gy', 'is.gd', 'shorturl.at', 'ow.ly', 'goo.gl', 'tiny.cc', 'buff.ly', 'rebrand.ly']
const SECOND_LEVEL = ['com', 'co', 'org', 'net', 'gov', 'edu', 'ac']

// keyword = text to look for in the address; official = the real main names for that brand.
// VERIFY this list before you ship, and add more brands as you confirm their real domains.
const BRANDS = [
  { name: 'GTBank', keywords: ['gtbank', 'gtco'], official: ['gtbank', 'gtco'] },
  { name: 'Zenith Bank', keywords: ['zenithbank'], official: ['zenithbank'] },
  { name: 'Access Bank', keywords: ['accessbank'], official: ['accessbankplc', 'accessbank'] },
  { name: 'First Bank', keywords: ['firstbank'], official: ['firstbanknigeria', 'firstbank'] },
  { name: 'Kuda', keywords: ['kuda'], official: ['kuda'] },
  { name: 'Moniepoint', keywords: ['moniepoint'], official: ['moniepoint'] },
  { name: 'PalmPay', keywords: ['palmpay'], official: ['palmpay'] },
  { name: 'Paystack', keywords: ['paystack'], official: ['paystack'] },
  { name: 'Flutterwave', keywords: ['flutterwave'], official: ['flutterwave'] },
  { name: 'JAMB', keywords: ['jamb'], official: ['jamb'] },
  { name: 'WAEC', keywords: ['waec'], official: ['waec', 'waecdirect', 'waecnigeria'] },
  { name: 'NIMC', keywords: ['nimc'], official: ['nimc'] },
  { name: 'CBN', keywords: ['cbn'], official: ['cbn'] },
  { name: 'PayPal', keywords: ['paypal'], official: ['paypal'] },
  { name: 'Google', keywords: ['google'], official: ['google'] },
  { name: 'Facebook', keywords: ['facebook'], official: ['facebook'] },
  { name: 'Instagram', keywords: ['instagram'], official: ['instagram'] },
  { name: 'WhatsApp', keywords: ['whatsapp'], official: ['whatsapp'] },
  { name: 'Microsoft', keywords: ['microsoft'], official: ['microsoft', 'microsoftonline'] },
  { name: 'Apple', keywords: ['apple', 'icloud'], official: ['apple', 'icloud'] },
  { name: 'Amazon', keywords: ['amazon'], official: ['amazon', 'amazonaws'] },
  { name: 'Netflix', keywords: ['netflix'], official: ['netflix'] },
  { name: 'Binance', keywords: ['binance'], official: ['binance'] },
]

const SENSITIVE_WORDS = ['login', 'signin', 'verify', 'verification', 'secure', 'update', 'confirm', 'account', 'wallet', 'bvn', 'nin', 'otp', 'password', 'claim']

export const LEVELS = {
  low: { label: 'No warning signs found', summary: "That doesn't prove it's safe. If money or personal details are involved, confirm through the official app or website." },
  medium: { label: 'Be careful', summary: 'A few things look off. Do not enter details or send money until you have confirmed it another way.' },
  high: { label: 'Likely a scam', summary: 'Several warning signs. Do not click, reply or pay. Contact the real organisation using a number or app you already trust.' },
  critical: { label: 'Dangerous', summary: 'This matches known scam patterns. Do not click, reply or pay, and warn anyone it was sent to.' },
}

export function levelFor(score) {
  if (score >= 60) return 'critical'
  if (score >= 35) return 'high'
  if (score >= 15) return 'medium'
  return 'low'
}

// ---------- finding links ----------
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|ng|co|info|xyz|top|click|link|site|online|live|icu|vip|app|dev|me|tk|ml|ga|cf|gq|work|rest|zip|cyou|buzz|sbs|cfd|biz|io|ly|gd|gy|cc|uk|us)\b(?:\/[^\s<>"'`]*)?/gi

export function extractUrls(text) {
  const found = (text || '').match(URL_PATTERN) || []
  const cleaned = found.map((u) => u.replace(/[.,;:!?)\]]+$/, ''))
  return [...new Set(cleaned)]
}

// ---------- reading one link ----------
function parseUrl(raw) {
  const s = raw.trim()
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s)
  const scheme = hasScheme ? s.split('://')[0].toLowerCase() : null
  const rest = hasScheme ? s.slice(s.indexOf('://') + 3) : s
  const authEnd = rest.search(/[/?#]/)
  const authority = authEnd === -1 ? rest : rest.slice(0, authEnd)
  const path = authEnd === -1 ? '' : rest.slice(authEnd)
  const at = authority.lastIndexOf('@')
  const hostPort = at === -1 ? authority : authority.slice(at + 1)
  const host = hostPort.replace(/:\d+$/, '').toLowerCase()
  return { scheme, host, path: path.toLowerCase(), hasAt: at !== -1, full: s }
}

function domainParts(host) {
  const parts = host.split('.')
  const tld = parts[parts.length - 1]
  const secondLevel = parts.length >= 3 && SECOND_LEVEL.includes(parts[parts.length - 2]) && tld.length === 2
  const mainLabel = parts[parts.length - (secondLevel ? 3 : 2)] || host
  return { parts, tld, mainLabel, registered: parts.slice(-(secondLevel ? 3 : 2)).join('.') }
}

// 0 -> o, 1 -> l, etc. Catches paypa1, g00gle, rnicrosoft
function unmask(s) {
  return s.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/rn/g, 'm').replace(/vv/g, 'w')
}

export function analyzeUrl(raw) {
  const u = parseUrl(raw)
  const flags = []
  const add = (id, label, detail, points) => flags.push({ id, label, detail, points })
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(u.host)
  const { parts, tld, mainLabel, registered } = domainParts(u.host)

  if (u.scheme === 'http') add('no-https', 'Not encrypted', 'The link uses http, not https, so anything you type can be intercepted.', 10)
  if (isIp) add('ip-host', 'Raw IP address', 'Real companies use names, not numbers like 192.0.2.1.', 30)
  if (u.hasAt) add('at-symbol', 'Hidden destination', "The '@' trick makes a link look like one site while sending you to another.", 25)
  if (u.host.includes('xn--')) add('punycode', 'Disguised characters', 'The address uses special characters that can mimic a real website.', 25)

  if (!isIp) {
    if (SHORTENERS.includes(u.host)) add('shortener', 'Shortened link', "A short link hides where it really goes. Don't open it from an unknown sender.", 15)
    if (SUSPICIOUS_TLDS.includes(tld)) add('tld', `Unusual ending (.${tld})`, 'This ending is cheap and heavily used by scam sites.', 15)
    if (parts.length >= 5) add('subdomains', 'Too many sections', 'Long chains of dots are often used to bury the real domain.', 10)
    if ((u.host.match(/-/g) || []).length >= 3) add('hyphens', 'Lots of hyphens', 'Scam addresses often stuff in hyphens, like secure-login-verify-bank.', 10)

    const plain = u.host
    const masked = unmask(u.host)
    for (const b of BRANDS) {
      const direct = b.keywords.some((k) => plain.includes(k))
      const disguised = !direct && b.keywords.some((k) => masked.includes(k))
      if (!direct && !disguised) continue
      if (b.official.includes(mainLabel)) continue
      if (disguised) add('lookalike', `Fake ${b.name} spelling`, `Swapped characters make this look like ${b.name}. It isn't their address.`, 40)
      else add('brand', `Pretends to be ${b.name}`, `${b.name} appears in the address, but ${registered} is not their website.`, 35)
      break
    }
  }

  const sensitive = SENSITIVE_WORDS.find((w) => u.path.includes(w) || u.host.includes(w))
  if (sensitive) add('sensitive', 'Asks you to log in or verify', `Words like "${sensitive}" are common in links that try to steal logins.`, 10)

  const score = Math.min(100, flags.reduce((n, f) => n + f.points, 0))
  return { url: u.full, host: u.host, score, flags }
}

// ---------- reading the message wording ----------
const TEXT_RULES = [
  { id: 'secrets', label: 'Asks for a code, PIN or password', detail: 'No real bank or company asks for your OTP, PIN or password by message.', points: 30, test: /(send|share|give|provide|enter|confirm|reply|tell|forward)[^.\n]{0,50}\b(otp|pin|password|passcode|cvv|token|one[- ]time)/i },
  { id: 'ids', label: 'Asks you to verify personal IDs', detail: 'Messages telling you to "verify" or "link" your BVN, NIN or card are a common trap.', points: 20, test: /(verify|update|link|confirm|validate|submit|upload)[^.\n]{0,50}\b(bvn|nin|national identity|card number|account number)/i },
  { id: 'urgency', label: 'Pressure and threats', detail: 'Scammers rush you so you do not stop to think.', points: 10, test: /(urgent|immediately|within \d+ ?(hours?|hrs?|minutes?|mins?)|last warning|act now|expires? (today|soon)|(account|line|sim|card)[^.\n]{0,25}(suspended|blocked|closed|deactivated|restricted|barred))/i },
  { id: 'prize', label: 'Too-good-to-be-true offer', detail: 'Surprise prizes, free money and guaranteed returns are classic bait.', points: 20, test: /(you(?:'ve| have)? (won|been selected)|congratulations|claim your|winner|lottery|giveaway|free (data|airtime|money)|loan (approved|offer)|guaranteed (returns?|profit)|double your|work from home|earn [₦$n]?\s?[\d,]+)/i },
  { id: 'advance-fee', label: 'Asks you to pay first', detail: 'Being told to pay a fee before you receive money or a job is the advance-fee scam.', points: 20, test: /(send|transfer|pay|deposit)[^.\n]{0,40}(₦|\bn\s?\d|ngn|naira|fee|registration|processing|activation|clearance)/i },
  { id: 'generic', label: 'Generic greeting', detail: 'Real banks use your name. "Dear customer" is a bulk message.', points: 5, test: /\bdear (customer|user|client|beneficiary|account holder|winner)\b/i },
]

export function analyzeMessage(text) {
  const input = (text || '').trim()
  const urls = extractUrls(input).map(analyzeUrl).sort((a, b) => b.score - a.score)
  const textFlags = TEXT_RULES.filter((r) => r.test.test(input)).map(({ id, label, detail, points }) => ({ id, label, detail, points }))

  const topUrl = urls.length ? urls[0].score : 0
  const textPoints = textFlags.reduce((n, f) => n + f.points, 0)
  const score = Math.min(100, topUrl + textPoints)
  const level = levelFor(score)

  const flags = [...(urls[0] ? urls[0].flags : []), ...textFlags].sort((a, b) => b.points - a.points)
  return { score, level, ...LEVELS[level], urls, textFlags, flags, hasInput: input.length > 0 }
}
