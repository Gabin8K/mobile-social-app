import { FunctionComponent, PropsWithChildren } from "react";
import ConfigProvider from "./ConfigProvider";
import MD3ThemeProvider from "./MD3ThemeProvider";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AuthProvider from "./AuthProvider";

const Providers: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <ConfigProvider>
          <AuthProvider>
            <MD3ThemeProvider>
              {children}
            </MD3ThemeProvider>
          </AuthProvider>
        </ConfigProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}


export default Providers;