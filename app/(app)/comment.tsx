import { StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { px } from '@/utlis/size';
import useAuth from '@/hooks/useAuth';
import { router } from 'expo-router';
import CommentComponent from '@/components/CommentComponent';
import ModalSheet from '@/components/ModalSheet';
import { Fragment, useRef, useState } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export default function CommentModal() {

  const { top } = useSafeAreaInsets()
  const { session } = useAuth();

  const [open, setOpen] = useState(false)
  const bottomSheetRef = useRef<BottomSheet>(null);

  const displayName = session?.user?.user_metadata?.displayName

  const onGoback = () => {
    router.back()
  }

  const onClose = () => {
    setOpen(false)
  }

  const onOpen = () => {
    setOpen(true)
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
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.modal}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
      <ModalSheet
        style={styles.modal}
        open={open}
        onClose={onClose}
      >
        <View style={styles.row}>
          <Text
            variant={'titleMedium'}
            style={{ fontSize: px(30) }}
          >
            Reply to
          </Text>
          <Avatar.Text
            size={px(35)}
            label={`Ag`}
          />
        </View>
        <TextInput
          multiline
          style={{ marginTop: px(20) }}
          placeholder={'Typing...'}
        />
        <Button
          mode={'contained'}
          onPress={() => { }}
        >
          Reply
        </Button>
      </ModalSheet>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: px(40),
    marginHorizontal: px(20),
  },
  modal: {
    rowGap: px(30),
    paddingHorizontal: px(30),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: px(10),
  },
})