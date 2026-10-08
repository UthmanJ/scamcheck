import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from './src/theme/useTheme'
import { HistoryProvider } from './src/context/HistoryContext'
import CheckScreen from './src/screens/CheckScreen'
import HistoryScreen from './src/screens/HistoryScreen'
import TipsScreen from './src/screens/TipsScreen'

const Tab = createBottomTabNavigator()
const icons = { Check: 'shield-checkmark', History: 'time', Tips: 'bulb' }

export default function App() {
  const { colors, isDark } = useTheme()
  const base = isDark ? DarkTheme : DefaultTheme

  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.line,
      primary: colors.accent,
    },
  }

  return (
    <SafeAreaProvider>
      <HistoryProvider>
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: colors.accent,
              tabBarInactiveTintColor: colors.mute,
              tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
            })}
          >
            <Tab.Screen name="Check" component={CheckScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Tips" component={TipsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </HistoryProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  )
}