import useTheme from "@/hooks/useTheme"
import { Redirect, Stack } from "expo-router"
import { Fragment, useEffect } from "react"
import { Platform } from "react-native"
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from "expo-status-bar"
import useAuth from "@/hooks/useAuth"


export default function AppLayout() {
  const { theme: { colors } } = useTheme()
  const { session } = useAuth()

  useEffect(() => {
    const launch = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync(colors.elevation.level2)
      }
    }
    launch()
  }, [colors])

  if (!session) {
    return <Redirect href={'/(auth)/login'} />
  }


  return (
    <Fragment>
      <StatusBar
        backgroundColor={colors.elevation.level2}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="comment"
          options={{
            // Set the presentation mode to modal for our modal route.
            presentation: 'modal',
            animation:'slide_from_bottom'
          }}
        />
      </Stack>
    </Fragment>
  )
}