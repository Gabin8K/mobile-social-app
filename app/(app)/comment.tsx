import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { px } from '@/utils/size';
import { router, useLocalSearchParams } from 'expo-router';
import ReplyComponent from '@/components/ReplyComponent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRecursiveCommentByPostId, Page, SubComment } from '@/services/supabase';
import ReplyProvider, { ModalState } from '@/components/ReplyContext';
import ReplyModal from '@/components/ReplyModal';



export default function CommentModal() {

  const { top } = useSafeAreaInsets()
  const { post_id, display_name } = useLocalSearchParams()
  const [comments, setComments] = useState<SubComment>([])
  const [page, setPage] = useState<Page>({ from: 0, take: 2 })

  const cantFetch = (page.count ?? 0) > (page.from + page.take);

  const onGoback = (state: ModalState) => {
    if (state.isModalOpen) {
      state.closeModal()
      return
    }
    router.back()
  }

  const onLike = () => {
    console.log('Like')
  }

  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<SubComment[number]>) {
    return (
      <ReplyComponent
        comment={item}
        onLike={onLike}
      />
    )
  }, [])

  const onFetchMore = () => {
    const _page = {
      from: page.from + page.take,
      take: page.take
    }
    loadData(_page)
  }

  const loadData = useCallback((page: Page) => {
    if (!page) return
    getRecursiveCommentByPostId(post_id as string, page).then(({ data }) => {
      if (!data) return
      setComments(comments => [...comments, ...data])
      setPage(p => ({
        ...page,
        count: p.count ? p.count : data[0].count
      }))
    })
  }, [post_id])


  useEffect(() => {
    loadData(page)
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
          <FlatList
            data={comments}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            ListFooterComponent={
              cantFetch ? <IconButton
                icon={'arrow-down'}
                mode={'contained'}
                size={px(30)}
                style={styles.button}
                onPress={onFetchMore}
              /> :
                null
            }
          />
          <ReplyModal visible={state.isModalOpen} />
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
    marginTop: px(25),
  }
})