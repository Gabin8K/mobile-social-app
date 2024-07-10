import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { px } from '@/utlis/size';
import useAuth from '@/hooks/useAuth';
import { router } from 'expo-router';
import CommentComponent from '@/components/CommentComponent';
import { Fragment, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import BottomSheetReply from '@/components/BottomSheetReply';

export default function CommentModal() {

  const { top } = useSafeAreaInsets()
  const { session } = useAuth();

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const displayName = session?.user?.user_metadata?.displayName

  const onGoback = () => {
    router.back()
  }

  const onOpen = () => {
    bottomSheetRef.current?.present()
  }

  const onLike = () => {
    console.log('Like')
  }

  return (
    <Fragment>
      <Appbar.Header
        elevated
        mode={'small'}
        style={{ marginTop: -top }}
      >
        <Appbar.BackAction onPress={onGoback} />
        <Appbar.Content
          title={`Reply to ${displayName}`}
          titleStyle={{ fontSize: px(35) }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <CommentComponent
          onLike={onLike}
          onReply={onOpen}
          comments={[
            [
              // [
              //   []
              // ]
            ]
          ]}
        />
      </View>
      <BottomSheetReply
        bottomSheetRef={bottomSheetRef}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: px(40),
    marginHorizontal: px(20),
  },
})