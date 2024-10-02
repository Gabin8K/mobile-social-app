import React, { useCallback, useState } from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import { Avatar, Button, Card, IconButton, Text, TextInput } from 'react-native-paper'
import { px } from '@/utils/size'
import { router } from 'expo-router'
import { createComment, createRepy, LikeParam, ListOfPostQuery, updateLikes } from '@/services/supabase'
import useToast from '@/hooks/useToast'
import useAuth from '@/hooks/useAuth'

type Props = ViewProps & {
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
  const { post, show, myPost, onShow, ...rest } = props

  const profile = post.profiles as any
  const avatar_name = profile.display_name.slice(0, 2)

  const toast = useToast()
  const { session } = useAuth()

  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [commentSize, setCommentSize] = useState(post.comment?.length ?? 0)
  const [like, setlike] = useState(Number(post.likes ?? 0))

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

  const onLike = async () => {
    const param: LikeParam = {
      user_id: session?.user.id as string,
      post_id: post.id,
      comment_id: null,
      like: true,
      isComment: false,
    }
    // setlike(l => l + 1)
  }

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
    <View
      {...rest}
    >
      <View style={styles.row}>
        <Avatar.Text
          size={px(50)}
          label={avatar_name}
        />
        <Text variant={'titleMedium'}>{profile.display_name}</Text>
      </View>
      <Card elevation={1}>
        <Card.Content>
          <Text>
            {post.content}
          </Text>
        </Card.Content>
        <View style={styles.footer}>
          <Button onPress={onLike}>👍 {like}</Button>
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
      </Card>
    </View>
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