import { createContext, useContext, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Tables } from "@/services/type";

type ReplyContextType = {
  parent_id?: string,
  profile?: Tables<'profiles'>,
  bottomSheetRef?: React.RefObject<BottomSheetModal>,
  setParentId: (id: string) => void,
  setProfile: (profile: ReplyContextType['profile']) => void
}

type Props = {
  children: React.ReactNode,
  bottomSheetRef: React.RefObject<BottomSheetModal>
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
        setProfile,
        bottomSheetRef: props.bottomSheetRef,
      }}
    >
      {props.children}
    </ReplyContext.Provider>
  )
}