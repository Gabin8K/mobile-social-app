import { createContext, useContext, useState } from "react";
import { Tables } from "@/services/type";

type ReplyContextType = {
  parent_id?: string,
  profile?: Tables<'profiles'>,
  setParentId: (id?: string) => void,
  setProfile: (profile?: ReplyContextType['profile']) => void
}

type Props = {
  children: React.ReactNode,
}

export const ReplyContext = createContext<ReplyContextType>({
  setParentId: () => { },
  setProfile: () => { },
});
export const useReply = () => useContext(ReplyContext);

export default function ReplyProvider(props: Props) {
  const [profile, setProfile] = useState<Tables<'profiles'>>()
  const [parent_id, setParentId] = useState<any>()

  return (
    <ReplyContext.Provider
      value={{
        parent_id,
        profile,
        setParentId,
        setProfile
      }}
    >
      {props.children}
    </ReplyContext.Provider>
  )
}