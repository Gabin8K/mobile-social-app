import PostComponent from '@/components/PostComponent';
import useAuth from '@/hooks/useAuth';
import supabase from '@/services/supabase';
import { px } from '@/utlis/size';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Appbar, Avatar, IconButton, TextInput, Tooltip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function HomeScreen() {
  const { top } = useSafeAreaInsets()
  const { session, setSession } = useAuth()

  const displayName = session?.user?.user_metadata?.displayName

  const onLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const onGoToSetting = () => {
    router.navigate('/(app)/setting')
  }

  return (
    <View style={styles.container}>
      <Appbar.Header
        elevated
        mode={'small'}
        style={{ marginTop: -top }}
      >
        <Appbar.Content
          title="Comment's"
          titleStyle={{ fontSize: px(35) }}
        />
        <View style={styles.headerRow}>
          <Tooltip title={'Setting'}>
            <IconButton
              icon={(props) => <Ionicons name={'settings'} {...props} />}
              size={px(40)}
              onPress={onGoToSetting}
            />
          </Tooltip>
          <Tooltip title={'Logout'}>
            <IconButton
              icon={(props) => <Ionicons name={'log-out'} {...props} />}
              size={px(40)}
              onPress={onLogout}
            />
          </Tooltip>
        </View>
      </Appbar.Header>
      <View style={styles.row}>
        <Avatar.Text
          size={px(100)}
          label={`${displayName?.charAt?.(0) ?? ''}${displayName?.charAt?.(1) ?? ''}`}
        />
        <TextInput
          multiline
          placeholder={'What\'s up?'}
          style={{ flex: 1 }}
        />
      </View>
      <View style={styles.content}>
        <PostComponent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    marginTop: px(40),
    columnGap: px(20),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: px(20),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    marginTop: px(60),
    paddingHorizontal: px(20),
  }
});
