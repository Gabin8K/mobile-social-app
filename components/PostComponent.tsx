import { StyleSheet, View } from 'react-native'
import React from 'react'
import { Avatar, Button, Card, Text } from 'react-native-paper'
import { px } from '@/utlis/size'
import { router } from 'expo-router'

type Props = {}

const PostComponent = (props: Props) => {

  const onGoToComment = () => {
    router.navigate('/(app)/comment')
  }

  return (
    <View>
      <View style={styles.row}>
        <Avatar.Text
          size={px(50)}
          label={`Ag`}
        />
        <Text variant={'titleMedium'} >Antony Igor</Text>
      </View>
      <Card elevation={1}>
        <Card.Content>
          <Text>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptates.
          </Text>
        </Card.Content>
        <View style={styles.footer}>
          <Button>👍 12</Button>
          <Button onPress={onGoToComment} >
            1,2k Comments
          </Button>
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: px(30),
    paddingBottom: px(10),
  }
})