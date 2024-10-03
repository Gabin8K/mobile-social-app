import useTheme from '@/hooks/useTheme'
import useToast from '@/hooks/useToast'
import supabase from '@/services/supabase'
import { px } from '@/utils/size'
import { Link, router } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { StyleSheet, TextInput as RNTextinput, View } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper'

type Props = {}


const Login = (props: Props) => {
  const { theme: { colors } } = useTheme()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const emailRef = React.useRef<RNTextinput>(null)

  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false);

  const disabled = !form.email || !form.password;

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password.trim(),
      })
      if (error) throw error
      router.replace('/(app)')
    } catch (err: any) {
      toast.message(String(err.message || err))
    }
    finally {
      setLoading(false)
    }
  }, [form])



  const onResetPassword = useCallback(async () => {
    if (!form.email) {
      emailRef.current?.focus()
      toast.message('Please enter your email')
      return;
    }
    router.navigate({
      pathname: '/(auth)/reset',
      params: { email: form.email }
    })
  }, [form.email])



  return (
    <View style={styles.container}>
      <Text variant={'displayLarge'}>Login</Text>
      <View style={styles.form}>
        <TextInput
          ref={emailRef}
          secureTextEntry={!show}
          label={'Email'}
          inputMode={'email'}
          placeholder={'Email'}
          autoCapitalize={'none'}
          onChangeText={(text) => setForm({ ...form, email: text })}
        />
        <TextInput
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
          disabled={disabled || loading}
          style={{ marginVertical: px(40) }}
          mode={'contained'}
          onPress={onSubmit}
          loading={loading}
        >
          Let me in
        </Button>
        <Text>
          Don't have an account?
          <Link href={'/signup'}>
            <Text
              variant={'labelMedium'}
              style={{ color: colors.primary }}
            >
              {' '}Sign up
            </Text>
          </Link>
        </Text>
        <View style={styles.row}>
          <Text>Forgot password?</Text>
          <Button
            mode={'text'}
            onPress={onResetPassword}
          >
            Reset password
          </Button>
        </View>
      </View>
    </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -px(20)
  }
})



export default Login