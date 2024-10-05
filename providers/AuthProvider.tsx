import supabase from "@/services/supabase";
import { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { createContext, FunctionComponent, PropsWithChildren, useEffect, useState } from "react";


type SessionType = {
  session: Session | null
  setSession: (session: SessionType['session']) => void
}

export const AuthContext = createContext<SessionType>({
  session: null,
  setSession: () => { },
})



const AuthProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)

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
    })
  }, [])


  return (
    <AuthContext.Provider
      value={{
        session,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


export default AuthProvider;