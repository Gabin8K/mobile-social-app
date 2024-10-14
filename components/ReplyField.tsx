import { memo, useCallback, useState } from "react";
import { IconButton, Text, TextInput } from "react-native-paper";
import { useReply } from "./ReplyContext";
import { px } from "@/utils/size";
import { createRepy } from "@/services/supabase";
import useToast from "@/hooks/useToast";
import useAuth from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import Animated, { SlideInDown, SlideOutDown, useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import useTheme from "@/hooks/useTheme";



const ReplyField = memo(function ReplyField() {
  const reply = useReply()
  const toast = useToast()
  const { session } = useAuth()
  const { post_id } = useLocalSearchParams()

  const { theme: { colors }, mode } = useTheme()
  const keyboard = useAnimatedKeyboard()

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')

  const onRequestClose = () => {
    reply?.closeModal()
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
        reply.setState({
          profile: undefined,
          parent_id: undefined,
          // Cette donnée est utilisée pour mettre a jour le commentaire récemment ajouté dans <ReplyComponent />
          currentSubComment: data
        })
        setText('')
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(false))
  }, [text, post_id, reply])


  const uas = useAnimatedStyle(() => {
    const translateY = -keyboard.height.value
    return {
      transform: [{ translateY }]
    }
  }, [])


  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown.duration(500)}
      style={[
        uas,
        styles.container,
        { backgroundColor: mode === 'dark' ? colors.elevation.level2 : colors.elevation.level3 }
      ]}
    >
      <View style={styles.row}>
        <Text>
          Reply to{' '}
          <Text style={{ fontFamily: 'WSb' }}>{reply.state?.profile?.display_name}</Text>
        </Text>
        <IconButton
          icon={'close'}
          size={px(40)}
          onPress={onRequestClose}
        />
      </View>
      <View style={styles.content}>
        <TextInput
          autoFocus
          multiline
          onChangeText={setText}
          placeholder={'Typing...'}
          style={styles.input}
        />
        <IconButton
          mode={'contained'}
          icon={'send'}
          onPress={onSubmit}
          loading={loading}
          disabled={loading || text.trim() === ''}
        />
      </View>
    </Animated.View>
  )
})


const styles = StyleSheet.create({
  container: {
    paddingBottom: px(10),
    paddingLeft: px(20),
  },
  content: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    height: px(50),
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
})


export default ReplyField;