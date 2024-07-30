
import PostComponent from '@/components/PostComponent';
import useTheme from '@/hooks/useTheme';
import { px } from '@/utlis/size';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listOfPost, ListOfPostQuery } from '@/services/supabase';
import useToast from '@/hooks/useToast';
import useBackhandler from '@/hooks/useBackhandler';



export default function ThreadScreen() {
  const { top } = useSafeAreaInsets()
  const { theme: { colors } } = useTheme()
  const toast = useToast()

  const [showBackHandlerId, setShowBackHandlerId] = useState<string>()
  const [data, setData] = useState<ListOfPostQuery | null>(null)


  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<ListOfPostQuery[number]>) {
    return (
      <View style={styles.item}>
        <PostComponent
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
    listOfPost()
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
        <Appbar.Content
          title="My Thread"
          titleStyle={{ fontSize: px(35) }}
        />
      </Appbar.Header>
      <Text
        variant={'bodyLarge'}
        style={{
          color: colors.primary,
          marginLeft: px(20),
        }}
      >
        {data?.length??0} Replies on your post
      </Text>
      <FlatList
        data={data}
        style={styles.content}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: px(30),
  },
  item: {
    padding: px(20),
    marginBottom: px(20),
    backgroundColor: 'rgba(0,0,0,.015)',
  }
});
