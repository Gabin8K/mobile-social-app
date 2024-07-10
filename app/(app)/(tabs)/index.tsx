import PostComponent from '@/components/PostComponent';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import supabase, { createPost, listOfPost, ListOfPostQuery } from '@/services/supabase';
import { px } from '@/utlis/size';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Avatar, IconButton, TextInput, Tooltip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function HomeScreen() {
  const { top } = useSafeAreaInsets()
  const toast = useToast()
  const { session, setSession } = useAuth()

  const displayName = session?.user?.user_metadata?.displayName
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ListOfPostQuery | null>(null)

  const onLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const onGoToSetting = () => {
    router.navigate('/(app)/setting')
  }

  const onCreatePost = useCallback((text: string) => () => {
    setLoading(true)
    createPost({
      user_id: session?.user?.id,
      content: text,
    })
      .then(() => setText(''))
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(false))
  }, [])


  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<ListOfPostQuery[number]>) {
    return (
      <PostComponent
        post={item}
        style={{ marginBottom: px(30) }}
      />
    )
  }, [])


  useEffect(() => {
    listOfPost()
      .then(({ data }) => setData(data))
      .catch(err => toast.message(String(err.message || err)))
  }, [])

console.log(data)
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
          value={text}
          onChangeText={setText}
          right={
            loading ?
              <TextInput.Icon icon={() => <ActivityIndicator size={px(30)} />} /> :
              text.trim() !== "" ?
                <TextInput.Icon icon={'arrow-right'} onPress={onCreatePost(text)} /> :
                null
          }
        />
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      />
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
    paddingHorizontal: px(20),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    marginTop: px(60),
    paddingHorizontal: px(20)
  }
});
