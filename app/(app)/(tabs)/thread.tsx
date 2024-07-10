import CommentComponent from '@/components/CommentComponent';
import ModalSheet from '@/components/ModalSheet';
import useTheme from '@/hooks/useTheme';
import { px } from '@/utlis/size';
import { Fragment, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Button, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function ThreadScreen() {
  const { top } = useSafeAreaInsets()
  const { theme: { colors } } = useTheme()

  const [open, setOpen] = useState(false)
  const [data] = useState([
    [
      []
    ],
    [],
    []
  ])

  const onOpen = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  const onLike = () => {
    console.log('Like')
  }

  const renderItem = useMemo(() => function ListItem({ item }: ListRenderItemInfo<any[]>) {
    return (
      <View style={styles.item}>
        <CommentComponent
          comments={item}
          onReply={onOpen}
          onLike={onLike}
        />
      </View>
    )
  }, [])


  return (
    <Fragment>
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
        2K Replies on your post
      </Text>
      <FlatList
        data={data}
        style={styles.content}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <ModalSheet
        style={styles.modal}
        open={open}
        onClose={onClose}
      >
        <View style={styles.row}>
          <Text
            variant={'titleMedium'}
            style={{ fontSize: px(30) }}
          >
            Reply to
          </Text>
          <Avatar.Text
            size={px(35)}
            label={`Ag`}
          />
        </View>
        <TextInput
          multiline
          style={{ marginTop: px(20) }}
          placeholder={'Typing...'}
        />
        <Button
          mode={'contained'}
          onPress={() => { }}
        >
          Reply
        </Button>
      </ModalSheet>
    </Fragment>
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
  },
  modal: {
    rowGap: px(30),
    paddingHorizontal: px(30),
    height: px(550),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: px(10),
  },
});
