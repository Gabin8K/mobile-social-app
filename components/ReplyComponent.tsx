import React, { memo, useEffect, useMemo, useState } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'
import { Avatar, Button, Card, Text } from 'react-native-paper'
import { px } from '@/utils/size'
import useTheme from '@/hooks/useTheme'
import { getRecursiveCommentById, Page, SubComment } from '@/services/supabase'
import { useReply } from './ReplyContext'
import { timeSince } from '@/utils/date'

type Props = {
  onLike?: () => void,
  comment?: SubComment[number],
}


const ReplyComponent = memo(function ReplyComponent(props: Props) {
  const { comment, onLike } = props
  const { theme: { colors } } = useTheme()

  const reply = useReply()
  const [subComments, setSubComments] = useState<SubComment | null>(null)
  const [page, setPage] = useState<Page | null>({ from: 0, to: 1 })

  const avatar_name = comment?.display_name?.slice(0, 2) ?? '';
  const diffCount = (comment?.childCount ?? 0) - (page?.to ?? 0);


  const onReply = () => {
    if (!comment) return
    reply?.setProfile({
      id: comment?.user_id,
      display_name: comment?.display_name,
      email: comment?.email
    })
    reply?.setParentId(comment?.id)
  }


  const onFetchMore = () => {
    if (!page) return
    setPage({
      from: page.to,
      to: page.to + 2
    })
  }


  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<SubComment[number]>) {
    return (
      <ReplyComponent
        comment={item}
      />
    )
  }, [])


  useEffect(() => {
    if (comment && page) {
      getRecursiveCommentById(comment.id, page).then(({ data }) => {
        if (!data) return;
        if (data.length === 0) {
          setPage(null)
          return
        }
        setSubComments(sub => [...(sub ?? []), ...data])
      })
    }
  }, [page])


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
                {timeSince(new Date(comment?.created_at ?? 0))}
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
      {subComments ?
        <View style={styles.child}>
          <FlatList
            data={subComments ?? []}
            extraData={subComments.length}
            renderItem={renderItem}
          />
        </View> :
        null
      }
      {(comment?.childCount ?? 0) > (page?.to ?? 0) ?
        <View style={styles.row3}>
          <Button
            labelStyle={{ marginLeft: 0 }}
            onPress={onFetchMore}
          >
            See {diffCount} more comments
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