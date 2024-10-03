import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'
import { Avatar, Button, Card, Text } from 'react-native-paper'
import { px } from '@/utils/size'
import useTheme from '@/hooks/useTheme'
import { getRecursiveCommentById, SubComment, updateLikes } from '@/services/supabase'
import { useReply } from './ReplyContext'
import { timeSince } from '@/utils/date'
import useAuth from '@/hooks/useAuth'
import { LikeParam, LikeState, Page } from '@/types'
import { AntDesign } from '@expo/vector-icons'

type Props = {
  comment?: SubComment[number],
}


const ReplyComponent = memo(function ReplyComponent(props: Props) {
  const { comment } = props
  const { theme: { colors } } = useTheme()

  const reply = useReply()
  const { session } = useAuth()
  const [subComments, setSubComments] = useState<SubComment | null>(null)
  const [page, setPage] = useState<Page | null>({ from: 0, take: 1 })
  const [cantFetch, setCantFetch] = useState(true)
  const [loading, setLoading] = useState(false)
  const [like, setLike] = useState<LikeState>({
    count: comment?.like_count ?? 0,
    isLiked: comment?.is_liked ?? false,
    loading: false
  })

  const avatar_name = comment?.display_name?.slice(0, 2) ?? '';
  const diffCount = (comment?.child.count ?? 0) - ((page?.from ?? 0) + 1);
  const seeMore = (comment?.child.count ?? 0) > ((page?.from ?? 0) + 1);


  const onReply = () => {
    if (!comment) return
    reply?.setState({
      parent_id: comment?.id,
      profile: {
        id: comment?.user_id,
        display_name: comment?.display_name,
        email: comment?.email
      }
    })
  }

  const onFetchMore = () => {
    if (!page) return
    const p = { from: page.from + page.take, take: page.take }
    loadData(p)
    setPage(p)
  }

  const onFetchMoreSubChild = () => {
    loadData(page)
    setCantFetch(false)
  }


  const onLike = useCallback(async () => {
    setLike(like => ({ ...like, loading: true }))
    try {
      const param: LikeParam = {
        user_id: session?.user.id as string,
        comment_id: comment?.id as string,
        post_id: null,
        like: !like.isLiked,
        isComment: true,
      }
      const response = await updateLikes(param)
      if (response.error) throw response.error;
      setLike(like => ({
        ...like,
        count: like.count + (like.isLiked ? -1 : 1),
        isLiked: !like.isLiked,
        loading: false
      }))
    } catch (err) {
      setLike(like => ({ ...like, loading: false }))
    }
  }, [like])


  const loadData = useCallback((page: Page | null) => {
    if (!page || !comment) return
    setLoading(true)
    getRecursiveCommentById(session?.user.id as string, comment.id, page).then(({ data }) => {
      if (!data) return;
      if (data.length === 0) {
        setPage(null)
        return
      }
      setSubComments(sub => [...(sub ?? []), ...data])
    })
      .finally(() => setLoading(false))
  }, [comment])


  useEffect(() => {
    // Cette fonction va ecouter le changement de l'etat du sous commentaire et mette a jour manuellement subComments
    if (reply.state?.currentSubComment?.parent_id === comment?.id) {
      if (!reply.state?.currentSubComment) return;
      const subComment: SubComment[number] = {
        ...(reply.state.currentSubComment as any),
        display_name: session?.user?.user_metadata?.displayName ?? '',
        email: session?.user?.user_metadata?.email ?? '',
        count: 1,
        child: {
          count: 0,
          hasChild: false
        }
      }
      setSubComments(sub => sub ?
        [...sub, { ...subComment, count: sub?.[0]?.count ?? 1 }] :
        [subComment]
      )
    }
  }, [reply.state?.currentSubComment])



  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<SubComment[number]>) {
    return (
      <ReplyComponent
        comment={item}
      />
    )
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
                {timeSince(comment?.created_at as any)}
              </Text>
              <Button
                loading={like.loading}
                onPress={onLike}
                icon={({ color, size }) => <AntDesign size={size} color={color} name={like.isLiked ? 'like1' : 'like2'} />}
              >
                {like.count}
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
      {/* 
        Pour afficher le sous commentaire il faut se rassurer que le parent ait un enfant dans le champ {child:{hasChild:true}}
      */}
      {(comment?.child.hasChild && cantFetch) ?
        <View style={styles.row3}>
          <Button
            disabled={loading}
            labelStyle={{ marginLeft: 0 }}
            onPress={onFetchMoreSubChild}
          >
            See More replies
          </Button>
        </View> :
        null
      }
      {/* 
        Pour parginer les commentaires il faut d'abord être sûr que le sous commentaire soit chargé
      */}
      {seeMore && !cantFetch ?
        <View style={styles.row3}>
          <Button
            disabled={loading}
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