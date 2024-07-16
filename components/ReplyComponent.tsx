import React, { memo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Avatar, Button, Card, Text } from 'react-native-paper'
import { px } from '@/utlis/size'
import useTheme from '@/hooks/useTheme'
import { GetComment } from '@/services/supabase'
import { useReply } from './ReplyContext'

type Props = {
  onLike?: () => void,
  parent_id?: string,
  comment?: GetComment[number],
}

const ReplyComponent = memo(function ReplyComponent(props: Props) {
  const { parent_id, comment, onLike } = props
  const { theme: { colors } } = useTheme()

  const [subComments, setSubComments] = useState<any>(null)

  const reply = useReply()

  const profile = comment?.profiles as any
  const avatar_name = profile.display_name.slice(0, 2)

  const onReply = () => {
    reply?.setProfile(profile)
    reply?.setParentId(comment?.id)
    reply?.bottomSheetRef?.current?.present()
  }

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.leftContainer}>
          <Avatar.Text
            size={px(50)}
            label={avatar_name}
          />
          <View style={[styles.divider, { backgroundColor: colors.elevation.level3 }]} />
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
                {new Date(comment?.created_at).toString().split(' ').slice(0, 5).join(' ')}
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
        <View style={[styles.shape1, { borderColor: colors.elevation.level3 }]} />
        <Avatar.Text
          size={px(35)}
          label={`Tg`}
        />
        <Text style={{ fontSize: px(22) }}>
          Lorem ipsum dolor sit...
        </Text>
        <View style={[styles.shape2, { borderColor: colors.elevation.level3 }]} />
      </View>
      {parent_id ?
        <View style={styles.child}>
          <View
            style={[
              styles.shape2,
              {
                borderColor: colors.elevation.level3,
                height: '105%'
              }
            ]}
          />
          {Array.isArray(comment) ?
            <ReplyComponent
              comment={subComments}
              parent_id={comment[0].parent_id}
            /> :
            <ReplyComponent />
          }
        </View> :
        null
      }
      <View style={styles.row3}>
        <View style={[styles.shape1, { borderColor: colors.elevation.level3 }]} />
        <Button
          labelStyle={{ marginLeft: 0 }}
          onPress={() => { }}
        >
          See 12 more comments
        </Button>
      </View>
    </View>
  )
})

export default ReplyComponent

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    columnGap: px(10),
  },
  leftContainer: {
    alignItems: 'center',
    rowGap: px(5),
  },
  divider: {
    flex: 1,
    width: px(3),
    borderRadius: px(3),
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
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: px(10),
    paddingLeft: px(24),
  },
  shape1: {
    width: px(20),
    height: '50%',
    alignSelf: 'flex-start',
    borderLeftWidth: px(2),
    borderBottomWidth: px(2),
    borderBottomLeftRadius: px(10),
  },
  shape2: {
    top: 0,
    left: px(24),
    width: px(20),
    height: '100%',
    position: 'absolute',
    alignSelf: 'flex-end',
    borderLeftWidth: px(2),
  },
  child: {
    paddingLeft: px(50),
    paddingTop: px(20),
  }
})