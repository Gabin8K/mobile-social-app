import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'
import { Avatar, Button, Card, Text } from 'react-native-paper'
import { px } from '@/utlis/size'
import { router } from 'expo-router'
import { ListOfPostQuery } from '@/services/supabase'
import { useComment } from './CommentContext'

type Props = ViewProps & {
  post: ListOfPostQuery[number]
}

const PostComponent = (props: Props) => {
  const { post, ...rest } = props

  const comment = useComment()

  const profile = post.profiles as any
  const avatar_name = profile.display_name.slice(0, 2)

  const onGoToComment = () => {
    router.navigate({
      pathname: '/(app)/comment',
      params: {
        post_id: post.id,
        display_name: profile.display_name
      }
    })
  }

  const onReply = () => {
    comment.setProfile(profile)
    comment.setPost(post)
    comment.bottomSheetRef?.current?.present()
  }

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
          <Button>👍 {post.likes ?? 0}</Button>
          <View style={styles.row2}>
            {post.comment ?
              <Button onPress={onGoToComment} >
                {post.comment?.length} Comments
              </Button> :
              null
            }
            <Button onPress={onReply} >
              Repy
            </Button>
          </View>
        </View>
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: px(30),
    paddingBottom: px(10),
  }
})