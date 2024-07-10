import { FunctionComponent, PropsWithChildren } from "react";
import ConfigProvider from "./ConfigProvider";
import MD3ThemeProvider from "./MD3ThemeProvider";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AuthProvider from "./AuthProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ToastProvider from "./ToastProvider";

const Providers: FunctionComponent<PropsWithChildren> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ConfigProvider>
            <ToastProvider>
              <AuthProvider>
                <MD3ThemeProvider>
                  {children}
                </MD3ThemeProvider>
              </AuthProvider>
            </ToastProvider>
          </ConfigProvider>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}


export default Providers;