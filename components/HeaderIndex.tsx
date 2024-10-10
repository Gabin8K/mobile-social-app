import useAuth from "@/hooks/useAuth";
import useToast from "@/hooks/useToast";
import { createPost } from "@/services/supabase";
import { px } from "@/utils/size";
import { memo, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, IconButton, TextInput } from "react-native-paper";
import Animated, { SlideInRight, SlideInUp, SlideOutRight } from "react-native-reanimated";


type Props = {
  loading: Loading,
  displayName?: string,
  setLoading: React.Dispatch<React.SetStateAction<Loading>>,
}

type Loading = {
  post: boolean,
  data: boolean,
  refresh: boolean,
}


const HeaderIndex = memo(function HeaderIndex(props: Props) {
  const { loading, setLoading } = props;
  const { session } = useAuth()
  const toast = useToast()

  const [text, setText] = useState('')

  const displayName = session?.user?.user_metadata?.displayName
  const visible = text.trim() !== "";

  const onCreatePost = useCallback((text: string) => () => {
    setLoading(l => ({ ...l, post: true }))
    createPost({
      user_id: session?.user?.id,
      content: text,
    })
      .then(({ error }) => {
        if (error) throw error
        setText('')
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(l => ({ ...l, post: false })))
  }, [])


  const onCreateFile = useCallback(() => {

  }, [])


  return (
    <Animated.View
      style={styles.row}
      entering={SlideInUp.duration(500)}
    >
      <Avatar.Text
        size={px(100)}
        label={`${displayName?.charAt?.(0) ?? ''}${displayName?.charAt?.(1) ?? ''}`}
      />
      <View style={styles.rowInput}>
        <TextInput
          multiline
          placeholder={'What\'s up?'}
          value={text}
          onChangeText={setText}
          right={visible ? <View style={styles.blank} /> : null}
          style={{ flex: 1 }}
        />
        {visible ?
          <Animated.View
            style={styles.rowIcons}
            entering={SlideInRight.duration(500)}
            exiting={SlideOutRight.duration(500)}
          >
            <IconButton
              size={px(40)}
              icon={'image-plus'}
              loading={loading.post}
              disabled={loading.post}
              onPress={onCreateFile}
              style={{ margin: 0 }}
            />
            <IconButton
              size={px(40)}
              icon={'arrow-right'}
              loading={loading.post}
              disabled={loading.post}
              onPress={onCreatePost(text)}
              style={{ margin: 0 }}
            />
          </Animated.View> :
          null
        }
      </View>
    </Animated.View >
  )
})


const styles = StyleSheet.create({
  row: {
    marginVertical: px(20),
    columnGap: px(20),
    flexDirection: 'row',
    paddingHorizontal: px(20),
  },
  rowInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  rowIcons: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blank: {
    width: px(230),
    height: px(20)
  }
})

export default HeaderIndex