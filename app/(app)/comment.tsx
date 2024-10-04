import React from 'react';
import { ListRenderItemInfo, StyleSheet } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { px } from '@/utils/size';
import { router, useLocalSearchParams } from 'expo-router';
import ReplyComponent from '@/components/ReplyComponent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getParentRecursiveCommentById, SubComment } from '@/services/supabase';
import ReplyProvider, { ModalState } from '@/components/ReplyContext';
import ReplyField from '@/components/ReplyField';
import { Page } from '@/types';
import useAuth from '@/hooks/useAuth';
import Animated, { LinearTransition, SlideInDown, SlideOutDown } from 'react-native-reanimated';



export default function CommentModal() {

  const { top } = useSafeAreaInsets()
  const { session } = useAuth()
  const { post_id, display_name } = useLocalSearchParams()
  const [comments, setComments] = useState<SubComment>([])
  const [page, setPage] = useState<Page>({ from: 0, take: 2 })
  const [loading, setLoading] = useState(false)

  const cantFetch = (page.count ?? 0) > page.from;

  const onGoback = (state: ModalState) => {
    if (state.isModalOpen) {
      state.closeModal()
      return
    }
    router.back()
  }

  const renderItem = useMemo(() => function ListItem({ item, index }: ListRenderItemInfo<SubComment[number]>) {
    return (
      <ReplyComponent
        index={index}
        comment={item}
      />
    )
  }, [])

  const onFetchMore = () => {
    loadData()
  }

  const loadData = useCallback(() => {
    if (!page) return
    setLoading(true)
    getParentRecursiveCommentById(session?.user.id as string, post_id as string, page).then(({ data }) => {
      if (!data) return
      setComments(comments => [...comments, ...data])
      setPage({
        ...page,
        from: page.from + page.take,
        count: data?.[0]?.count ?? page.count
      })
    }).finally(() => setLoading(false))
  }, [post_id, page])


  useEffect(() => {
    loadData()
  }, [])


  return (
    <>
      <ReplyProvider>
        {(state) => <>
          <Appbar.Header
            elevated
            mode={'small'}
            style={{ marginTop: -top }}
          >
            <Appbar.BackAction onPress={() => onGoback(state)} />
            <Appbar.Content
              title={`Reply to ${display_name}`}
              titleStyle={{ fontSize: px(35) }}
            />
          </Appbar.Header>
          <Animated.FlatList
            data={comments}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            itemLayoutAnimation={LinearTransition}
          />
          {cantFetch ?
            <Animated.View
              entering={SlideInDown.duration(500)}
              exiting={SlideOutDown.duration(500)}
            >
              <IconButton
                icon={'arrow-down'}
                mode={'contained'}
                size={px(30)}
                style={styles.button}
                onPress={onFetchMore}
                loading={loading}
              />
            </Animated.View> :
            null
          }
          <ReplyField visible={state.isModalOpen} />
        </>
        }
      </ReplyProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: px(20),
    paddingBottom: px(50),
    paddingHorizontal: px(20),
  },
  button: {
    alignSelf: 'center',
  }
})