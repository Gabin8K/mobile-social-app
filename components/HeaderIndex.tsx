import useAuth from "@/hooks/useAuth";
import useToast from "@/hooks/useToast";
import { createPost, ListOfPostQuery } from "@/services/supabase";
import { px } from "@/utils/size";
import { Fragment, memo, useCallback, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Avatar, IconButton, TextInput } from "react-native-paper";
import Animated, { SlideInRight, SlideInUp, SlideOutRight } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";
import useMediaFile from "../hooks/useMediaFile";


type Props = {
  loading: Loading,
  displayName?: string,
  setLoading: React.Dispatch<React.SetStateAction<Loading>>,
  onCreated?: React.Dispatch<React.SetStateAction<ListOfPostQuery>>,
}

type Loading = {
  post: boolean,
  data: boolean,
  refresh: boolean,
}


const HeaderIndex = memo(function HeaderIndex(props: Props) {
  const { loading, setLoading, onCreated } = props;
  const { session } = useAuth()

  const toast = useToast()
  const media = useMediaFile()
  const { theme: { colors } } = useTheme()

  const [text, setText] = useState('')

  const displayName = session?.user?.user_metadata?.displayName
  const visible = text.trim() !== "";

  const onCreatePost = useCallback((text: string) => () => {
    setLoading(l => ({ ...l, post: true }))
    createPost({ user_id: session?.user?.id, content: text }, media.file)
      .then(({ error, data }) => {
        if (error) throw error
        const _post = {
          ...data?.[0],
          count: 0,
          image_url: undefined,
          like_count: 0,
          is_liked: false,
          comment: [],
          profiles: {
            id: session?.user?.id,
            email: session?.user?.email,
            display_name: session?.user?.user_metadata?.displayName,
          }
        }
        onCreated?.(post => [_post, ...post])
        setText('')
      })
      .catch(err => toast.message(String(err.message || err)))
      .finally(() => setLoading(l => ({ ...l, post: false })))
  }, [media.file, onCreated])


  const onCreateFile = useCallback(async () => {
    try {
      await media.uploadFile()
    } catch (err: any) {
      toast.message(String(err.message || err))
    }
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
            {media.hasPermission !== false ?
              <Fragment>
                {media.file ?
                  <MaterialCommunityIcons
                    name={'close'}
                    size={px(30)}
                    color={colors.tertiary}
                    disabled={loading.post}
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
                  disabled={loading.post}
                  onPress={onCreateFile}
                  style={{ margin: 0 }}
                />
              </Fragment> :
              null
            }
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
  },
  image: {
    width: px(60),
    height: px(60),
    objectFit: 'contain'
  },
  close: {
    position: 'absolute',
    top: px(-15),
    left: px(40),
    zIndex: 1,
  }
})

export default HeaderIndex