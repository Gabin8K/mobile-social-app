import useAuth from '@/hooks/useAuth'
import useToast from '@/hooks/useToast'
import supabase from '@/services/supabase'
import { px } from '@/utils/size'
import { makeRedirectUri } from 'expo-auth-session'
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { Fragment, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper'

type Props = {}

const redirectTo = makeRedirectUri()

const Signup = (props: Props) => {

  const auth = useAuth();
  console.log(redirectTo)
  const { email } = useLocalSearchParams()

  const [form, setForm] = useState({
    password: '',
  })

  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false);

  const onSubmit = useCallback(async () => {
    setLoading(true)
    try {
      auth.resetPassword(form.password)
      await supabase.auth.resetPasswordForEmail(email as string, { redirectTo })
      toast.message('Please check your email')
    } catch (err: any) {
      toast.message(String(err.message || err))
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
        <Text variant={'displayLarge'}>Reset Password</Text>
        <View style={styles.form}>
          <Text
            variant={'titleLarge'}
            style={styles.email}
          >
            {email}
          </Text>
          <TextInput
            secureTextEntry={!show}
            disabled={loading}
            label={'New Password'}
            placeholder={'New Password'}
            right={
              <TextInput.Icon
                onPress={() => setShow(c => !c)}
                icon={'eye'}
              />
            }
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          <Button
            loading={loading}
            disabled={loading || form.password.length < 4}
            style={{ marginVertical: px(40) }}
            mode={'contained'}
            onPress={onSubmit}
          >
            Apply
          </Button>
        </View>
      </View>
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
  email: {
    textAlign: 'center'
  }
})



export default Signup