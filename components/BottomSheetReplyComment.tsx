import { StyleSheet, View } from 'react-native'
import React, { memo, useCallback, useState } from 'react'
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { px } from '@/utlis/size';
import { Avatar, Button, Text, TextInput } from 'react-native-paper';
import useTheme from '@/hooks/useTheme';
import { useReply } from './ReplyContext';
import useToast from '@/hooks/useToast';
import { createRepy } from '@/services/supabase';
import useAuth from '@/hooks/useAuth';
import { useLocalSearchParams } from 'expo-router';


type Props = {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods>
}

const BottomSheetReplyComment = (props: Props) => {
  const { bottomSheetRef } = props;
  const { theme: { colors } } = useTheme();

  const { session } = useAuth()
  const reply = useReply()
  const toast = useToast()
  const { post_id } = useLocalSearchParams()

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')

  const onClose = () => {
    bottomSheetRef.current?.dismiss()
  }

  const onSubmit = useCallback(() => {
    setLoading(true)
    createRepy({
      content: text,
      user_id: session?.user.id,
      parent_id: reply.parent_id as string,
      post_id: post_id as string,
    })
      .then(({ error }) => {
        if (error) throw error
        setText('')
        onClose()
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(false))
  }, [text, reply])

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
              label={reply?.profile?.display_name?.slice(0, 2) ?? ''}
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
            onPress={onSubmit}
            loading={loading}
            disabled={text.trim().length === 0 || loading}
          >
            Reply
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

export default memo(BottomSheetReplyComment)

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