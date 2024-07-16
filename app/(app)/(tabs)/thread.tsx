import BottomSheetReplyComment from '@/components/BottomSheetReplyComment';
import PostComponent from '@/components/PostComponent';
import useTheme from '@/hooks/useTheme';
import { px } from '@/utlis/size';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CommentProvider from '@/components/CommentContext';
import { listOfPost, ListOfPostQuery } from '@/services/supabase';
import useToast from '@/hooks/useToast';



export default function ThreadScreen() {
  const { top } = useSafeAreaInsets()
  const { theme: { colors } } = useTheme()
  const toast = useToast()

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [data, setData] = useState<ListOfPostQuery | null>(null)


  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<ListOfPostQuery[number]>) {
    return (
      <View style={styles.item}>
        <PostComponent
          post={item}
        />
      </View>
    )
  }, [])

  useEffect(() => {
    listOfPost()
      .then(({ data }) => setData(data))
      .catch(err => toast.message(String(err.message || err)))
  }, [])


  return (
    <CommentProvider
      bottomSheetRef={bottomSheetRef}
    >
      <Appbar.Header
        elevated
        mode={'small'}
        style={{ marginTop: -top }}
      >
        <Appbar.Content
          title="My Thread"
          titleStyle={{ fontSize: px(35) }}
        />
      </Appbar.Header>
      <Text
        variant={'bodyLarge'}
        style={{
          color: colors.primary,
          marginLeft: px(20),
        }}
      >
        2K Replies on your post
      </Text>
      <FlatList
        data={data}
        style={styles.content}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
     <BottomSheetReplyComment
        bottomSheetRef={bottomSheetRef}
      />
    </CommentProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: px(30),
  },
  item: {
    padding: px(20),
    marginBottom: px(20),
    backgroundColor: 'rgba(0,0,0,.015)',
  }
});
