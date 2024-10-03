import useToast from "@/hooks/useToast";
import supabase from "@/services/supabase";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { createContext, FunctionComponent, PropsWithChildren, useEffect, useState } from "react";


type SessionType = {
  session: Session | null
  resetPassword: (password: string) => void;
  setSession: (session: SessionType['session']) => void
}

export const AuthContext = createContext<SessionType>({
  session: null,
  setSession: () => { },
  resetPassword: () => { }
})



const AuthProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const toast = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [password, setPassword] = useState<string>()

  const resetPassword = (password: string) => {
    setPassword(password)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        router.replace('/(app)/')
      }
    })

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSession(session)
        router.replace('/(app)')
      }
      if (event === 'PASSWORD_RECOVERY') {
        try {
          const { error } = await supabase.auth.updateUser({ password })
          if (error) throw error;
          toast.message('Password reset successfully')
          router.replace('/(app)')
        } catch (err: any) {
          toast.message(String(err.message || err))
        }
      }
    })
  }, [password])


  return (
    <AuthContext.Provider
      value={{
        session,
        setSession,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


export default AuthProvider;