import { StyleSheet, View } from 'react-native'
import React, { memo } from 'react'
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { px } from '@/utlis/size';
import { Avatar, Button, Text, TextInput } from 'react-native-paper';
import useTheme from '@/hooks/useTheme';


type Props = {
  bottomSheetRef: React.RefObject<BottomSheetModalMethods>
}

const BottomSheetReply = (props: Props) => {
  const { bottomSheetRef } = props;
  const { theme: { colors } } = useTheme();

  const onClose = () => {
    bottomSheetRef.current?.dismiss()
  }

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
              label={`Ag`}
            />
          </View>
          <TextInput
            multiline
            style={{ marginTop: px(20) }}
            placeholder={'Typing...'}
            render={innerProps => <BottomSheetTextInput {...innerProps as any} />}
          />
          <Button
            mode={'contained'}
            onPress={() => { }}
          >
            Reply
          </Button>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

export default memo(BottomSheetReply)

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