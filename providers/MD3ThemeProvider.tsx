
import React, { FunctionComponent, PropsWithChildren, useState } from "react";
import { navigationTheme, theme } from "@/theme";
import { ThemeProvider } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";

type ThemeType = {
  mode: 'light' | 'dark',
  setMode: (mode: ThemeType['mode']) => void
}


export const ThemeContext = React.createContext<ThemeType>({
  mode: 'light',
  setMode: () => { }
})


const MD3ThemeProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {

  const schema = useColorScheme()
  const [mode, setMode] = useState<ThemeType['mode']>(schema ?? 'light')

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode
      }}
    >
      <PaperProvider theme={theme[mode]}>
        <ThemeProvider value={navigationTheme[mode]} >
        {children}
        </ThemeProvider>
      </PaperProvider>
    </ThemeContext.Provider>
  )
}


export default MD3ThemeProvider;