import { memo, useCallback, useState } from "react";
import { Dialog, IconButton, TextInput } from "react-native-paper";
import { useReply } from "./ReplyContext";
import { px } from "@/utils/size";
import { createRepy } from "@/services/supabase";
import useToast from "@/hooks/useToast";
import useAuth from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";

type Props = {
  visible: boolean,
}

const ReplyModal = memo(function ReplyModal(props: Props) {
  const reply = useReply()
  const toast = useToast()
  const { session } = useAuth()
  const { post_id } = useLocalSearchParams()

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')

  const onRequestClose = () => {
    reply?.setState(undefined)
  }

  const onSubmit = useCallback(() => {
    setLoading(true)
    createRepy({
      content: text,
      user_id: session?.user.id,
      parent_id: reply.state?.parent_id as string,
      post_id: post_id as string,
    })
      .then(({ data, error }) => {
        if (error) throw error
        console.log(data)
        setText('')
        onRequestClose()
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(false))
  }, [text, post_id, reply])


  return (
    <Dialog
      visible={props.visible}
      onDismiss={onRequestClose}
    >
      <Dialog.Title style={{ fontSize: px(28) }}>Reply to {reply.state?.profile?.display_name} </Dialog.Title>
      <Dialog.Content>
        <TextInput
          multiline
          numberOfLines={3}
          onChangeText={setText}
          placeholder={'Typing...'}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <IconButton
          icon={'send'}
          onPress={onSubmit}
          loading={loading}
          disabled={loading || text.trim() === ''}
        />
        <IconButton
          icon={'close'}
          onPress={onRequestClose}
        />
      </Dialog.Actions>
    </Dialog>
  )
})


export default ReplyModal;