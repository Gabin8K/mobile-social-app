import { Fragment, memo, useCallback, useState } from "react";
import { IconButton, Text, TextInput } from "react-native-paper";
import { useReply } from "./ReplyContext";
import { px } from "@/utils/size";
import { createReply } from "@/services/supabase";
import useToast from "@/hooks/useToast";
import useAuth from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import Animated, { SlideInDown, SlideInRight, SlideOutDown, SlideOutRight, useAnimatedKeyboard, useAnimatedStyle } from "react-native-reanimated";
import useTheme from "@/hooks/useTheme";
import useMediaFile from "@/hooks/useMediaFile";
import { MaterialCommunityIcons } from "@expo/vector-icons";



const ReplyField = memo(function ReplyField() {
  const reply = useReply()
  const toast = useToast()
  const { session } = useAuth()
  const { post_id } = useLocalSearchParams()

  const { theme: { colors }, mode } = useTheme()
  const keyboard = useAnimatedKeyboard()
  const media = useMediaFile()

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const visible = text.trim() !== "";

  const onRequestClose = () => {
    reply?.closeModal()
  }

  const onSubmit = useCallback(() => {
    setLoading(true)
    createReply(
      {
        content: text,
        user_id: session?.user.id,
        parent_id: reply.state?.parent_id as string,
        post_id: post_id as string,
      },
      media.file
    )
      .then(({ data, error }) => {
        if (error) throw error
        reply.setState({
          profile: undefined,
          parent_id: undefined,
          // Cette donnée est utilisée pour mettre a jour le commentaire récemment ajouté dans <ReplyComponent />
          currentSubComment: {
            ...data,
            file: media.file
          }
        })
        setText('')
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(false))
  }, [text, post_id, reply, media.file])



  const onCreateFile = useCallback(async () => {
    try {
      await media.uploadFile()
    } catch (err: any) {
      toast.message(String(err.message || err))
    }
  }, [])


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
        <View style={styles.rowInput}>
          <TextInput
            autoFocus
            multiline
            onChangeText={setText}
            placeholder={'Typing...'}
            style={styles.input}
            right={<View style={styles.blank} />}
          />
          {visible ?
            <Animated.View
              style={styles.rowIcons}
              entering={SlideInRight.duration(500)}
              exiting={SlideOutRight.duration(500)}
            >
              {media.hasPermission !== false ?
                <Fragment>
                  {media.file ?
                    <MaterialCommunityIcons
                      name={'close'}
                      size={px(30)}
                      color={colors.tertiary}
                      onPress={media.reset}
                      style={styles.close}
                    /> :
                    null
                  }
                  <IconButton
                    size={px(40)}
                    icon={!media.file ?
                      'image-plus' :
                      () => (
                        <Image
                          source={{ uri: media.file?.uri }}
                          style={styles.image}
                        />
                      )
                    }
                    disabled={loading}
                    onPress={onCreateFile}
                    style={{ margin: 0 }}
                  />
                </Fragment> :
                null
              }
            </Animated.View> :
            null
          }
        </View>
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
    alignItems: 'center',
  },
  rowInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    minHeight: px(120),
    justifyContent: 'center',
  },
  rowIcons: {
    position: 'absolute',
    right: px(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  blank: {
    width: px(130),
    height: px(20)
  },
  close: {
    position: 'absolute',
    top: px(-15),
    left: px(40),
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  image: {
    width: px(60),
    height: px(60),
    objectFit: 'contain'
  },
})


export default ReplyField;