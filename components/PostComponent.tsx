import React, { useCallback, useState } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import { Avatar, Button, Card, IconButton, Text, TextInput } from 'react-native-paper'
import { px } from '@/utils/size'
import { router, usePathname } from 'expo-router'
import { createComment, createRepy, ListOfPostQuery, updateLikes } from '@/services/supabase'
import useToast from '@/hooks/useToast'
import useAuth from '@/hooks/useAuth'
import { LikeParam, LikeState } from '@/types'
import { AntDesign } from '@expo/vector-icons'
import Animated, { LinearTransition, SlideInLeft } from 'react-native-reanimated'
import useTheme from '@/hooks/useTheme'
import { useRefreshTabs } from '@/providers/RefreshTabsProvider'

type Props = ViewProps & {
  index: number,
  show?: boolean,
  myPost?: boolean,
  post: ListOfPostQuery[number]
  onShow?: (id?: string) => void
}

type Response = {
  data?: any
  error?: any
}


const PostComponent = (props: Props) => {
  const { index, post, show, myPost, onShow, style, ...rest } = props

  const profile = post.profiles as any
  const avatar_name = profile.display_name.slice(0, 2)

  const toast = useToast()
  const { session } = useAuth()
  const { theme: { colors } } = useTheme()
  const pathname = usePathname()

  const refreshTabs = useRefreshTabs()

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [commentSize, setCommentSize] = useState(post.comment?.length ?? 0)
  const [like, setLike] = useState<LikeState>({
    count: post.like_count,
    isLiked: post.is_liked,
    loading: false
  })

  const onGoToComment = () => {
    router.navigate({
      pathname: '/comment',
      params: {
        post_id: post.id,
        display_name: profile.display_name
      }
    })
  }

  const onShowReply = () => {
    onShow?.(post.id)
  }

  const onLike = useCallback(async () => {
    setLike(like => ({ ...like, loading: true }))
    try {
      const param: LikeParam = {
        user_id: session?.user.id as string,
        post_id: post.id,
        comment_id: null,
        like: !like.isLiked,
        isComment: false,
      }
      const response = await updateLikes(param)
      if (response.error) throw response.error;
      setLike(like => ({
        ...like,
        count: like.count + (like.isLiked ? -1 : 1),
        isLiked: !like.isLiked,
        loading: false
      }))
      if(pathname === '/') {
        refreshTabs.update('thread')  
      }
      if(pathname === '/thread') {
        refreshTabs.update('index')
      }
    } catch (err: any) {
      toast.message(String(err.message || err))
      setLike(like => ({ ...like, loading: false }))
    }
  }, [like])

  const onSubmit = useCallback(async () => {
    setLoading(true)
    try {
      let response: Response;
      if (myPost) {
        response = await createRepy({
          content: text,
          user_id: session?.user.id,
          parent_id: null,
          post_id: post?.id,
        })
      } else {
        response = await createComment({
          user_id: session?.user?.id,
          post_id: post.id,
          content: text
        })
      }
      if (response.error) throw response.error
      setText('')
      onShow?.(undefined)
      setCommentSize(c => c + 1)
    } catch (err: any) {
      toast.message(String(err.message || err))
    } finally {
      setLoading(false)
    }
  }, [text])



  return (
    <Animated.View
      {...rest}
      style={[style, { backgroundColor: colors.background }]}
      entering={SlideInLeft.delay(index * 90)}
    >
      <View style={styles.row}>
        <Avatar.Text
          size={px(50)}
          label={avatar_name}
        />
        <Text variant={'titleMedium'}>{profile.display_name}</Text>
      </View>
      <Card elevation={1}>
        <Animated.View
          layout={LinearTransition}
        >
          <Card.Content>
            <Text style={{ marginTop: px(10) }}>
              {post.content}
            </Text>
          </Card.Content>
          <View style={styles.footer}>
            <Button
              loading={like.loading}
              onPress={onLike}
              icon={({ color, size }) => <AntDesign size={size} color={color} name={like.isLiked ? 'like1' : 'like2'} />}
            >
              {like.count}
            </Button>
            <View style={styles.row2}>
              {post.comment ?
                <Button
                  onPress={onGoToComment}
                  disabled={commentSize === 0}
                >
                  {commentSize} Comments
                </Button> :
                null
              }
              <Button onPress={onShowReply} >
                Repy
              </Button>
            </View>
          </View>
          {show ?
            <View style={styles.row3}>
              <TextInput
                autoFocus
                multiline
                label={'Type your comment'}
                mode={'flat'}
                style={styles.input}
                onChangeText={setText}
                disabled={loading}
              />
              <IconButton
                icon={'send'}
                loading={loading}
                disabled={loading || text.trim() === ''}
                onPress={onSubmit}
              />
            </View> :
            null
          }
        </Animated.View>
      </Card>
    </Animated.View>
  )
}

export default PostComponent

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: px(10),
    marginBottom: px(15),
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: px(30),
  },
  input: {
    flex: 1,
    maxHeight: px(90),
    justifyContent: 'center',
    fontSize: px(25),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: px(30),
    paddingBottom: px(10),
  }
})