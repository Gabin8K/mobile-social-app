import { px } from "@/utlis/size";
import { configureFonts } from "react-native-paper";



const fonts = configureFonts({
  config: {
    displaySmall: {
      fontFamily:'WM',
      fontSize: px(26),
    },
    displayMedium: {
      fontFamily:'WM',
      fontSize: px(55),
    },
    displayLarge: {
      fontFamily:'WM',
      fontSize: px(67),
    },
    headlineSmall: {
      fontFamily:'WM',
      fontSize: px(24),
    },
    headlineMedium: {
      fontFamily:'WM',
      fontSize: px(28),
    },
    headlineLarge: {
      fontFamily:'WM',
      fontSize: px(32),
    },
    titleSmall: {
      fontFamily:'WSb',
      fontSize: px(30),
    },
    titleMedium: {
      fontFamily:'WSb',
      fontSize: px(26),
    },
    titleLarge: {
      fontFamily:'WM',
      fontSize: px(32),
    },
    labelSmall: {
      fontFamily:'WSb',
      fontSize: px(28),
    },
    labelMedium: {
      fontFamily:'WSb',
      fontSize: px(28),
    },
    labelLarge: {
      fontFamily:'WSb',
      fontSize: px(26),
    },
    bodySmall: {
      fontFamily:'WM',
      fontSize: px(28),
    },
    bodyMedium: {
      fontFamily:'WM',
      fontSize: px(24),
    },
    bodyLarge: {
      fontFamily:'WM',
      fontSize: px(26),
    },
    default: {
      fontFamily:'WM',
      fontSize: px(28),
    },
  } as any,
  isV3: true,
})

export default fonts 