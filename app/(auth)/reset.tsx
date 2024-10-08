import OtpInput from '@/components/OtpInput'
import useTheme from '@/hooks/useTheme'
import useToast from '@/hooks/useToast'
import supabase, { confirmPassword } from '@/services/supabase'
import { px } from '@/utils/size'
import { Ionicons } from '@expo/vector-icons'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import React, { Fragment, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper'

type Props = {}


const Signup = (props: Props) => {

  const { email } = useLocalSearchParams()
  const { theme: { colors } } = useTheme()

  const [form, setForm] = useState({
    password: '',
    code: '',
    errorCode: false
  })

  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false);

  const onSubmit = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await confirmPassword({
        email: email as string,
        code: form.code,
        password: form.password
      })
      if (error) throw error
      const request = await supabase.auth.signInWithPassword({
        email: email as string,
        password: form.password.trim(),
      })
      if (request.error) throw request.error
      router.replace('/(app)')
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
        <View style={styles.row}>
          <Ionicons
            name={'mail-unread'}
            size={px(40)}
            color={colors.outlineVariant}
          />
          <Text
            variant={'titleLarge'}
            style={styles.email}
          >
            {email}
          </Text>
        </View>
        <View style={styles.form}>
          <OtpInput
            value={form.code}
            onChange={(code) =>setForm({ ...form, code })}
          />
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
            onChangeText={(password) => setForm({ ...form, password })}
          />
          <Button
            loading={loading}
            disabled={loading || form.password.length < 4 || form.code.length < 5}
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
    marginTop: px(100),
    rowGap: px(30),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: px(10),
  },
  email: {
    textAlign: 'center'
  }
})



export default Signup