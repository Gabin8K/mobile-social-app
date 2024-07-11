import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { px } from '@/utlis/size';
import { router, useLocalSearchParams } from 'expo-router';
import CommentComponent from '@/components/CommentComponent';
import { Fragment, useMemo, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetReplyPost from '@/components/BottomSheetReplyPost';
import { ListOfPostQuery } from '@/services/supabase';

export default function CommentModal() {

  const { top } = useSafeAreaInsets()
  const { post_id, display_name, ...params } = useLocalSearchParams()
  const comments = JSON.parse(params.comments as string)
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const onGoback = () => {
    router.back()
  }

  const onOpen = () => {
    bottomSheetRef.current?.present()
  }

  const onLike = () => {
    console.log('Like')
  }

  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<ListOfPostQuery[number]['comment'][number]>) {
    return (
      <CommentComponent
        comment={item}
        onReply={onOpen}
        onLike={onLike}
      />
    )
  },[])

  return (
    <Fragment>
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
      <BottomSheetReplyPost
        bottomSheetRef={bottomSheetRef}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: px(40),
    paddingHorizontal: px(20),
  },
})