import { Theme } from "@react-navigation/native";
import { MD3LightTheme } from "react-native-paper";
import type { ThemeProp } from "react-native-paper/lib/typescript/types";
import fonts from "./typography";
import palette from "./palette";


const light: ThemeProp = {
  ...MD3LightTheme,
  colors: palette.light,
  fonts
}

const dark: ThemeProp = {
  ...MD3LightTheme,
  colors: palette.dark,
  fonts
}



export const navigationTheme: Record<string, Theme> = {
  light: {
    dark: false,
    colors: {
      primary: palette.light.primary,
      background: palette.light.background,
      card: palette.light.inverseOnSurface,
      text: palette.light.secondary,
      border: palette.light.tertiary,
      notification: palette.light.surfaceVariant
    }
  },
  dark: {
    dark: true,
    colors: {
      primary: palette.dark.primary,
      background: palette.dark.background,
      card: palette.dark.inverseOnSurface,
      text: palette.dark.secondary,
      border: palette.dark.tertiary,
      notification: palette.dark.surfaceVariant
    }
  },
} as const;

export const theme = {
  light,
  dark
} as const;