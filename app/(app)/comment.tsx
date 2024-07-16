import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { px } from '@/utlis/size';
import { router, useLocalSearchParams } from 'expo-router';
import ReplyComponent from '@/components/ReplyComponent';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GetComment, getCommentById } from '@/services/supabase';
import ReplyProvider from '@/components/ReplyContext';
import BottomSheetReplyComment from '@/components/BottomSheetReplyComment';

export default function CommentModal() {

  const { top } = useSafeAreaInsets()
  const { post_id, display_name } = useLocalSearchParams()
  const [comments, setComments] = useState<GetComment>([])
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onGoback = () => {
    router.back()
  }

  const onLike = () => {
    console.log('Like')
  }

  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<GetComment[number]>) {
    return (
      <ReplyComponent
        comment={item}
        onLike={onLike}
      />
    )
  }, [])

  useEffect(() => {
    getCommentById(post_id as string).then(({ data }) => {
      if(!data) return
      setComments(data)
    })
  }, [])
  

  return (
    <ReplyProvider
      bottomSheetRef={bottomSheetRef}
    >
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
      <BottomSheetReplyComment
        bottomSheetRef={bottomSheetRef}
      />
    </ReplyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: px(40),
    paddingHorizontal: px(20),
  },
})