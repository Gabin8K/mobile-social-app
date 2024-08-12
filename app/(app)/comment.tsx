import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { px } from '@/utlis/size';
import { router, useLocalSearchParams } from 'expo-router';
import ReplyComponent from '@/components/ReplyComponent';
import { useEffect, useMemo, useState } from 'react';
import { GetComment, getCommentById } from '@/services/supabase';
import ReplyProvider from '@/components/ReplyContext';
import ReplyModal from '@/components/ReplyModal';

export default function CommentModal() {

  const { top } = useSafeAreaInsets()
  const { post_id, display_name } = useLocalSearchParams()
  const [comments, setComments] = useState<GetComment>([])

  const onGoback = () => {
    router.back()
  }

  const onLike = () => {
    console.log('Like')
  }

  const renderItem = useMemo(() => function ListItem({ item, index }: ListRenderItemInfo<GetComment[number]>) {
    return (
      <ReplyComponent
        comment={item}
        onLike={onLike}
      />
    )
  }, [])

  useEffect(() => {
    getCommentById(post_id as string).then(({ data }) => {
      if (!data) return
      setComments(data)
    })
  }, [])


  return (
    <ReplyProvider>
      <Appbar.Header
        elevated
        mode={'small'}
        style={{ marginTop: -top }}
      >
        <Appbar.BackAction onPress={onGoback} />
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
      />
      <ReplyModal />
    </ReplyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: px(20),
    paddingHorizontal: px(20),
  },
})