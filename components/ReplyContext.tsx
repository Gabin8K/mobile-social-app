import { createContext, useContext, useState } from "react";
import { Tables } from "@/services/type";

type ReplyContextType = {
  parent_id?: string,
  profile?: Tables<'profiles'>,
  setParentId: (id?: string) => void,
  setProfile: (profile?: ReplyContextType['profile']) => void
}

export type ModalState = {
  isModalOpen: boolean;
  onCloseModal: () => void;
}
type Props = {
  children: ((props: ModalState) => React.ReactNode) | React.ReactNode,
}

export const ReplyContext = createContext<ReplyContextType>({
  setParentId: () => { },
  setProfile: () => { },
});

export const useReply = () => useContext(ReplyContext);



export default function ReplyProvider(props: Props) {
  const [profile, setProfile] = useState<Tables<'profiles'>>()
  const [parent_id, setParentId] = useState<any>()

  const isModalOpen = !!(profile && parent_id);

  const onCloseModal = () => {
    setProfile(undefined)
    setParentId(undefined)
  }

  return (
    <ReplyContext.Provider
      value={{
        parent_id,
        profile,
        setParentId,
        setProfile
      }}
    >
      {typeof props.children === 'function' ?
        props.children({
          isModalOpen,
          onCloseModal
        }) :
        props.children
      }
    </ReplyContext.Provider>
  )
}