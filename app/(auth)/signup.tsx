import supabase from '@/services/supabase'
import { px } from '@/utlis/size'
import { makeRedirectUri } from 'expo-auth-session'
import { router, Stack } from 'expo-router'
import React, { Fragment, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Snackbar, Text, TextInput } from 'react-native-paper'

type Props = {}


const emailRedirectTo = makeRedirectUri();


const Signup = (props: Props) => {

  const [form, setForm] = useState({
    email: '',
    password: '',
    displayName: '',
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false);

  const disabled = !form.email || !form.password || !form.displayName;

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password.trim(),
        options: {
          data: { displayName: form.displayName.trim() },
          emailRedirectTo,
        }
      })

      if (error) throw error
      router.back()
    } catch (err: any) {
      setMessage(String(err.message || err))
    }
    finally {
      setLoading(false)
    }
  }, [form])

  return (
    <Fragment>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <Text variant={'displayLarge'}>Sign up</Text>
        <View style={styles.form}>
          <TextInput
            label={'Dispaly name'}
            placeholder={'Dispaly name'}
            onChangeText={(text) => setForm({ ...form, displayName: text })}
          />
          <TextInput
            label={'Email'}
            inputMode={'email'}
            placeholder={'Email'}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <TextInput
            secureTextEntry={!show}
            label={'Password'}
            placeholder={'Password'}
            right={
              <TextInput.Icon
                onPress={() => setShow(c => !c)}
                icon={'eye'}
              />
            }
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          <Button
            disabled={disabled}
            style={{ marginVertical: px(40) }}
            mode={'contained'}
            onPress={onSubmit}
            loading={loading}
          >
            Create account
          </Button>
        </View>
      </View>
      <Snackbar
        visible={!!message}
        onIconPress={() => setMessage('')}
        onDismiss={() => setMessage('')}
      >
        {message}
      </Snackbar>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    width: '100%',
    paddingHorizontal: px(50),
    marginTop: px(20),
    rowGap: px(20),
  },
})



export default Signup