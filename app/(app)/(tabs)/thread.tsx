
import React from 'react';
import PostComponent from '@/components/PostComponent';
import useTheme from '@/hooks/useTheme';
import { px } from '@/utils/size';
import { useEffect, useMemo, useState } from 'react';
import { ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listOfPostByUserId, ListOfPostQuery } from '@/services/supabase';
import useToast from '@/hooks/useToast';
import useBackhandler from '@/hooks/useBackhandler';
import useAuth from '@/hooks/useAuth';
import Animated, { LinearTransition, SlideInLeft } from 'react-native-reanimated';



export default function ThreadScreen() {
  const { top } = useSafeAreaInsets()
  const { theme: { colors } } = useTheme()
  const toast = useToast()
  const { session } = useAuth()

  const [showBackHandlerId, setShowBackHandlerId] = useState<string>()
  const [data, setData] = useState<ListOfPostQuery | null>(null)

  const replieCount = data?.reduce((acc, post) => acc + post?.comment.length, 0) ?? 0;
  const repliesArray = [
    `${data?.length ?? 0} Posts Found`,
    `${replieCount} Replies`
  ]


  const renderItem = useMemo(() => function ListItem({ item, index }: ListRenderItemInfo<ListOfPostQuery[number]>) {
    return (
      <View style={styles.item}>
        <PostComponent
          index={index}
          post={item}
          show={showBackHandlerId === item.id}
          onShow={setShowBackHandlerId}
        />
      </View>
    )
  }, [showBackHandlerId])


  useBackhandler(() => {
    if (showBackHandlerId) {
      setShowBackHandlerId(undefined)
      return true
    }
    return false
  })

  useEffect(() => {
    listOfPostByUserId(session?.user?.id as string)
      .then(({ data }) => setData(data))
      .catch(err => toast.message(String(err.message || err)))
  }, [])


  return (
    <>
      <Appbar.Header
        elevated
        mode={'small'}
        style={{ marginTop: -top }}
      >
        {showBackHandlerId ?
          <Animated.View
            entering={SlideInLeft}
          >
            <Appbar.BackAction onPress={() => setShowBackHandlerId(undefined)} />
          </Animated.View> :
          null
        }
        <Animated.View
          layout={LinearTransition}
          style={[styles.title, { marginLeft: showBackHandlerId ? 0 : px(20) }]}
        >
          <Appbar.Content
            title="My Thread"
            titleStyle={{ fontSize: px(35) }}
          />
        </Animated.View>
      </Appbar.Header>
      <View style={styles.row}>
        {repliesArray.map((text, index) => (
          <Text
            key={index}
            variant={'bodyLarge'}
            style={{ color: colors.primary}}
          >
            {text}
          </Text>
        ))}
      </View>
      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        itemLayoutAnimation={LinearTransition}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: px(30),
    paddingBottom: px(50),
  },
  title: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  row:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: px(20),
  },
  item: {
    padding: px(20),
    marginBottom: px(20),
    backgroundColor: 'rgba(0,0,0,.015)',
  }
});
