import PostComponent from '@/components/PostComponent';
import useAuth from '@/hooks/useAuth';
import useBackhandler from '@/hooks/useBackhandler';
import { usePaginationRange } from '@/hooks/usePaginationRange';
import useTheme from '@/hooks/useTheme';
import useToast from '@/hooks/useToast';
import supabase, { createPost, listOfPost, ListOfPostQuery } from '@/services/supabase';
import { px } from '@/utils/size';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Avatar, IconButton, TextInput, Tooltip } from 'react-native-paper';
import Animated, { LinearTransition, SlideInLeft, SlideInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';




export default function HomeScreen() {
  const { top } = useSafeAreaInsets()
  const toast = useToast()
  const { theme: { colors } } = useTheme()
  const { session, setSession } = useAuth()

  const [text, setText] = useState('')
  const [loading, setLoading] = useState({
    post: false,
    data: false,
    refresh: false,
  })
  const [showBackHandlerId, setShowBackHandlerId] = useState<string>()
  const [data, setData] = useState<ListOfPostQuery>([])

  const pagination = usePaginationRange({ itemsPerPage: 4 })

  const displayName = session?.user?.user_metadata?.displayName

  const onLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const onGoToSetting = () => {
    router.navigate('/setting')
  }

  const onCreatePost = useCallback((text: string) => () => {
    setLoading(l => ({ ...l, post: true }))
    createPost({
      user_id: session?.user?.id,
      content: text,
    })
      .then(({ error }) => {
        if (error) throw error
        setText('')
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(l => ({ ...l, post: false })))
  }, [])


  const renderItem = useMemo(() => function ListItem({ item, index }: ListRenderItemInfo<ListOfPostQuery[number]>) {
    return (
      <PostComponent
        index={index}
        post={item}
        show={showBackHandlerId === item.id}
        onShow={setShowBackHandlerId}
        style={{ marginBottom: px(30) }}
      />
    )
  }, [showBackHandlerId])


  const onRefresh = () => {
    setLoading(l => ({ ...l, refresh: true }))
    pagination.refresh()
  }

  const loadMoreData = () => {
    pagination.nextPage()
  }


  useBackhandler(() => {
    if (showBackHandlerId) {
      setShowBackHandlerId(undefined)
      return true
    }
    return false
  })


  useEffect(() => {
    setLoading(l => ({ ...l, data: true }))
    listOfPost(session?.user?.id as string, pagination.from, pagination.to)
      .then(({ data }) => {
        if (pagination.currentPage === 1) {
          setData(data)
        } else {
          setData(prev => [...prev, ...data])
        }
        pagination.setTotalItems(data?.[0]?.count ?? 0)
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(l => ({
        ...l,
        data: false,
        refresh: false
      })))
  }, [pagination.currentPage, pagination.from])


  return (
    <View style={styles.container}>
      <Appbar.Header
        elevated
        mode={'small'}
        style={{ marginTop: -top }}
      >
        {showBackHandlerId ?
          <Animated.View
            entering={SlideInLeft}
          >
            <Appbar.BackAction onPress={() => setShowBackHandlerId(undefined)} />
          </Animated.View> :
          null
        }
        <Animated.View
          layout={LinearTransition}
          style={[styles.title, { marginLeft: showBackHandlerId ? 0 : px(20) }]}
        >
          <Appbar.Content
            title="Comment's"
            titleStyle={{ fontSize: px(35) }}
          />
        </Animated.View>
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
      <Animated.View
        style={styles.row}
        entering={SlideInUp.duration(500)}
      >
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
            text.trim() !== "" ?
              <TextInput.Icon
                icon={'arrow-right'}
                loading={loading.post}
                disabled={loading.post}
                onPress={onCreatePost(text)}
              /> :
              null
          }
        />
      </Animated.View>
      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            progressBackgroundColor={colors.secondary}
            refreshing={loading.refresh}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        itemLayoutAnimation={LinearTransition}
        ListFooterComponent={loading.data ? <ActivityIndicator size={px(40)} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  row: {
    marginVertical: px(20),
    columnGap: px(20),
    flexDirection: 'row',
    paddingHorizontal: px(20),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  content: {
    paddingTop: px(60),
    paddingHorizontal: px(20)
  }
});
