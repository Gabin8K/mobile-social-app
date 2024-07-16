import { StyleSheet, View } from 'react-native'
import React, { memo, useCallback, useState } from 'react'
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { px } from '@/utlis/size';
import { Avatar, Button, Text, TextInput } from 'react-native-paper';
import useTheme from '@/hooks/useTheme';
import { useComment } from './CommentContext';
import { createComment } from '@/services/supabase';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';


type Props = {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods>
}

const BottomSheetReplyPost = (props: Props) => {
  const { bottomSheetRef } = props;

  const toast = useToast()
  const comment = useComment()
  const { session } = useAuth()
  const { theme: { colors } } = useTheme();

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')

  const onClose = () => {
    bottomSheetRef.current?.dismiss()
  }

  const onSubmit = useCallback(() => {
    setLoading(true)
    createComment({
      user_id: session?.user?.id,
      post_id: comment.post?.id,
      content: text
    })
      .then(({error}) => {
        if (error) throw error
        setText('')
        onClose()
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(false))
  }, [text, comment])

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={['25%']}
        onDismiss={onClose}
        enablePanDownToClose
        enableDismissOnClose
        keyboardBehavior={'interactive'}
        handleIndicatorStyle={{ backgroundColor: colors.onSurfaceDisabled }}
        backgroundStyle={{ backgroundColor: colors.elevation.level3 }}
      >
        <BottomSheetView style={styles.modal}>
          <View style={styles.row}>
            <Text
              variant={'titleMedium'}
              style={{ fontSize: px(30) }}
            >
              Reply to
            </Text>
            <Avatar.Text
              size={px(35)}
              label={comment?.profile?.display_name?.slice(0, 2) ?? ''}
            />
          </View>
          <TextInput
            multiline
            value={text}
            onChangeText={setText}
            style={{ marginTop: px(20) }}
            placeholder={'Typing...'}
            render={innerProps => <BottomSheetTextInput {...innerProps as any} />}
          />
          <Button
            mode={'contained'}
            disabled={text.trim() === '' || loading}
            loading={loading}
            onPress={onSubmit}
          >
            Reply
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

export default memo(BottomSheetReplyPost)

const styles = StyleSheet.create({
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