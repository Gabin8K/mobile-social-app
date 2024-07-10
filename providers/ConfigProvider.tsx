import { useFonts } from "expo-font";
import * as NavigationBar from 'expo-navigation-bar';
import { Fragment, FunctionComponent, PropsWithChildren, useEffect } from "react";
import { Platform } from "react-native";


const ConfigProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [loaded] = useFonts({
    WM: require('../assets/fonts/WorkSans-Medium.ttf'),
    WB: require('../assets/fonts/WorkSans-Bold.ttf'),
    WEb: require('../assets/fonts/WorkSans-ExtraBold.ttf'),
    WSb: require('../assets/fonts/WorkSans-SemiBold.ttf'),
  });

  useEffect(() => {
    const launch = async () => {
      if (Platform.OS === 'android') {
        await NavigationBar.setPositionAsync('absolute')
        await NavigationBar.setBackgroundColorAsync('transparent')
      }
    }
    launch()
  }, [])


  if (!loaded) {
    return null;
  }

  return (
    <Fragment>
      {children}
    </Fragment>
  )
}


export default ConfigProvider;