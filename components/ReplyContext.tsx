import { createContext, useContext, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Tables } from "@/services/type";

type ReplyContextType = {
  reply?: any,
  profile?: Tables<'profiles'>,
  bottomSheetRef?: React.RefObject<BottomSheetModal>,
  setReply: (reply: any) => void,
  setProfile: (profile: ReplyContextType['profile']) => void
}

type Props = {
  children: React.ReactNode,
  bottomSheetRef: React.RefObject<BottomSheetModal>
}

export const ReplyContext = createContext<ReplyContextType>({
  setReply: () => { },
  setProfile: () => { },
});
export const useComment = () => useContext(ReplyContext);

export default function CommentProvider(props: Props) {
  const [profile, setProfile] = useState<Tables<'profiles'>>()
  const [reply, setReply] = useState<any>()

  return (
    <ReplyContext.Provider
      value={{
        reply,
        profile,
        setReply,
        setProfile,
        bottomSheetRef: props.bottomSheetRef,
      }}
    >
      {props.children}
    </ReplyContext.Provider>
  )
}