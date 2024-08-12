import React, { memo, useEffect, useMemo, useState } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'
import { Avatar, Button, Card, Text } from 'react-native-paper'
import { px } from '@/utlis/size'
import useTheme from '@/hooks/useTheme'
import { GetComment, GetRecursiveComment, getRecursiveCommentById } from '@/services/supabase'
import { useReply } from './ReplyContext'
import { timeSince } from '@/utlis/date'

type Props = {
  onLike?: () => void,
  comment?: GetComment[number],
  count?: number,
}

type SubComment = {
  comment?: GetRecursiveComment | GetRecursiveComment[number],
  count?: number,
}

const ReplyComponent = memo(function ReplyComponent(props: Props) {
  const { comment, count = 0, onLike } = props
  const { theme: { colors } } = useTheme()

  const reply = useReply()
  const [subComments, setSubComments] = useState<SubComment | null>(null)

  const profile = comment?.profiles as any
  const avatar_name = profile?.display_name?.slice(0, 2)

  const onReply = () => {
    reply?.setProfile(profile)
    reply?.setParentId(comment?.id)
  }


  const renderItem = useMemo(() => function ListItem({ item, index }: ListRenderItemInfo<SubComment['comment']>) {
    const itemComment = item as GetRecursiveComment[number]
    return (
      <ReplyComponent
        key={itemComment.id}
        comment={itemComment}
        count={subComments?.count}
      />
    )
  }, [subComments])


  useEffect(() => {
    if (comment) {
      getRecursiveCommentById(comment.id).then(({ data, count }) => {
        if (!data) return
        setSubComments({
          count: count ?? 0,
          comment: data
        })
      })
    }
  }, [])


  return (
    <View>
      <View style={[styles.mask, { backgroundColor: colors.background }]} />
      <View style={[styles.divider, { borderColor: colors.elevation.level3 }]} />
      <View style={styles.row}>
        <View style={styles.leftContainer}>
          {comment?.parent_id ?
            <View style={[styles.shape3, { borderColor: colors.elevation.level3 }]} /> :
            null
          }
          <Avatar.Text
            size={px(50)}
            label={avatar_name}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Card elevation={1}>
            <Card.Content>
              <Text>
                {comment?.content}
              </Text>
            </Card.Content>
          </Card>
          <View style={styles.footer}>
            <View style={styles.row2}>
              <Text style={{ color: colors.tertiary }}>
                {timeSince(new Date(comment?.created_at))}
              </Text>
              <Button
                textColor={colors.tertiary}
                onPress={onLike}
              >
                👍 {comment?.likes ?? 0}
              </Button>
            </View>
            <Button onPress={onReply} >
              Reply
            </Button>
          </View>
        </View>
      </View>
      <View style={styles.row3}>
        <Avatar.Text
          size={px(35)}
          label={`Tg`}
        />
        <Text style={{ fontSize: px(22) }}>
          {' '}Lorem ipsum dolor sit...
        </Text>
      </View>
      {subComments ?
        <View style={styles.child}>
          {Array.isArray(subComments?.comment) ?
            <FlatList
              data={subComments.comment??[]}
              renderItem={renderItem}
            /> :
            <ReplyComponent comment={subComments.comment as GetRecursiveComment[number]} />
          }
        </View> :
        null
      }
      {(count > 1) ?
        <View style={styles.row3}>
          <Button
            labelStyle={{ marginLeft: 0 }}
            onPress={() => { }}
          >
            See 12 more comments
          </Button>
        </View> :
        null
      }
    </View>
  )
})

export default ReplyComponent

const styles = StyleSheet.create({
  row: {
    zIndex: 2,
    flexDirection: 'row',
    columnGap: px(10),
    paddingTop: px(20),
  },
  leftContainer: {
    alignItems: 'center',
    rowGap: px(5),
  },
  mask: {
    top: px(-17.5),
    zIndex: 1,
    width: px(50),
    height: px(50),
    position: 'absolute',
    backgroundColor: 'orange'
  },
  divider: {
    bottom: px(17.5),
    left: px(23),
    width: px(25),
    height: '100%',
    position: 'absolute',
    borderBottomLeftRadius: px(10),
    borderLeftWidth: px(2),
    borderBottomWidth: px(2),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row3: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: px(60),
  },
  shape3: {
    top: 0,
    position: 'absolute',
    width: px(25),
    height: px(25),
    left: px(-25),
    borderLeftWidth: px(2),
    borderBottomWidth: px(2),
    borderBottomLeftRadius: px(10),
  },
  child: {
    paddingLeft: px(50),
  }
})