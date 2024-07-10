import useTheme from "@/hooks/useTheme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment } from "react";

export default function AuthLayout() {
  const { theme: { colors } } = useTheme()

  return (
    <Fragment>
      <StatusBar backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerShown: false
        }}
      />
    </Fragment>
  )
}