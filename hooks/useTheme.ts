import { useContext } from 'react';
import { ThemeContext } from '@/providers/MD3ThemeProvider';
import { useTheme as useM3Theme } from 'react-native-paper';


export default function useTheme() {
  const theme = useM3Theme();
  const { setMode, mode } = useContext(ThemeContext)

  return {
    mode,
    theme,
    changeMode: setMode
  }
}