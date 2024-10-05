
import React from 'react';
import PostComponent from '@/components/PostComponent';
import useTheme from '@/hooks/useTheme';
import { px } from '@/utils/size';
import { useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listOfPostByUserId, ListOfPostQuery } from '@/services/supabase';
import useToast from '@/hooks/useToast';
import useBackhandler from '@/hooks/useBackhandler';
import useAuth from '@/hooks/useAuth';
import Animated, { LinearTransition, SlideInLeft, SlideInUp } from 'react-native-reanimated';
import { usePaginationRange } from '@/hooks/usePaginationRange';



export default function ThreadScreen() {
  const { top } = useSafeAreaInsets()
  const { theme: { colors } } = useTheme()
  const toast = useToast()
  const { session } = useAuth()

  const [showBackHandlerId, setShowBackHandlerId] = useState<string>()
  const [data, setData] = useState<ListOfPostQuery>([])
  const [loading, setLoading] = useState({
    post: false,
    data: false,
    refresh: false,
  })

  const pagination = usePaginationRange({ itemsPerPage: 4 })

  const replieCount = data?.reduce((acc, post) => acc + post?.comment.length, 0) ?? 0;
  const repliesArray = [
    `${data?.length ?? 0} Posts Found`,
    `${replieCount} Replies`
  ]


  const renderItem = useMemo(() => function ListItem({ item, index }: ListRenderItemInfo<ListOfPostQuery[number]>) {
    return (
      <View style={styles.item}>
        <PostComponent
          index={index}
          post={item}
          show={showBackHandlerId === item.id}
          onShow={setShowBackHandlerId}
        />
      </View>
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
    listOfPostByUserId(session?.user?.id as string, pagination.from, pagination.to)
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
    <>
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
            title="My Thread"
            titleStyle={{ fontSize: px(35) }}
          />
        </Animated.View>
      </Appbar.Header>
      <Animated.View
        entering={SlideInUp.duration(800)}
        style={styles.row}
      >
        {repliesArray.map((text, index) => (
          <Text
            key={index}
            variant={'bodyLarge'}
            style={{ color: colors.primary }}
          >
            {text}
          </Text>
        ))}
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
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: px(30),
    paddingBottom: px(50),
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: px(20),
  },
  item: {
    padding: px(20),
    marginBottom: px(20),
    backgroundColor: 'rgba(0,0,0,.015)',
  }
});
