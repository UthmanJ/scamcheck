import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'scamcheck:history:v1'
const MAX_ITEMS = 100
const MAX_TEXT = 2000

const HistoryContext = createContext(null)

export function HistoryProvider({ children }) {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          try {
            setItems(JSON.parse(raw))
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const persist = useCallback((next) => {
    setItems(next)
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {})
  }, [])

  const add = useCallback(
    (text, result) => {
      const entry = {
        id: String(Date.now()),
        text: text.trim().slice(0, MAX_TEXT),
        score: result.score,
        level: result.level,
        createdAt: Date.now(),
      }
      persist([entry, ...items.filter((i) => i.text !== entry.text)].slice(0, MAX_ITEMS))
    },
    [items, persist]
  )

  const remove = useCallback((id) => persist(items.filter((i) => i.id !== id)), [items, persist])
  const clear = useCallback(() => persist([]), [persist])

  const value = useMemo(() => ({ items, loaded, add, remove, clear }), [items, loaded, add, remove, clear])

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export function useHistory() {
  return useContext(HistoryContext)
}