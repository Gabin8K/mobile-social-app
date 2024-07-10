import useTheme from '@/hooks/useTheme';
import { px } from '@/utlis/size';
import { router } from 'expo-router';
import { Fragment, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Switch, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function SettingScreen() {
  const theme = useTheme()
  const { top } = useSafeAreaInsets()

  const [setting, setSetting] = useState({
    mode: theme.mode,
  })

  const onToggleMode = () => {
    const mode = setting.mode === 'dark' ? 'light' : 'dark'
    setSetting({
      ...setting,
      mode
    })
    theme.changeMode(mode)
  }

  const onGoBack = () => {
    router.back()
  }

  return (
    <Fragment>
      <Appbar.Header
        elevated
        mode={'small'}
        style={{ marginTop: -top }}
      >
        <Appbar.BackAction onPress={onGoBack} />
        <Appbar.Content
          title="Setting"
          titleStyle={{ fontSize: px(35) }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={[styles.row, {borderColor:theme.theme.colors.elevation.level3}]}>
          <Text variant={'titleLarge'} >
            {setting.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Switch
            value={setting.mode === 'dark'}
            onValueChange={onToggleMode}
          />
        </View>
      </View>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: px(20),
    paddingHorizontal: px(20),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: px(40),
    borderBottomWidth: px(2),
    justifyContent: 'space-between',
  },
});
