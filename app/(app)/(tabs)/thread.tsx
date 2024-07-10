import BottomSheetReply from '@/components/BottomSheetReply';
import CommentComponent from '@/components/CommentComponent';
import useTheme from '@/hooks/useTheme';
import { px } from '@/utlis/size';
import { Fragment, useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';



export default function ThreadScreen() {
  const { top } = useSafeAreaInsets()
  const { theme: { colors } } = useTheme()

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [data] = useState([
    [
      []
    ],
    [],
    []
  ])

  const onOpen = () => {
    bottomSheetRef.current?.present()
  }

  const onLike = () => {
    console.log('Like')
  }

  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<any[]>) {
    return (
      <View style={styles.item}>
        <CommentComponent
          comments={item}
          onReply={onOpen}
          onLike={onLike}
        />
      </View>
    )
  }, [])


  return (
    <Fragment>
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
     <BottomSheetReply
        bottomSheetRef={bottomSheetRef}
      />
    </Fragment>
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
