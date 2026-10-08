import { useColorScheme } from 'react-native'
import { light, dark } from './colors'

export function useTheme() {
  const isDark = useColorScheme() === 'dark'
  return { isDark, colors: isDark ? dark : light }
}