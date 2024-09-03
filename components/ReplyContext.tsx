import React, { createContext, useContext, useState } from "react";
import { Tables } from "@/services/type";
import { SubComment } from "@/services/supabase";

type State = {
  parent_id?: string,
  profile?: Tables<'profiles'>,
}

type ReplyContextType = {
  state?: State,
  setState: (state?: State) => void,
  setCurrentSubComment: React.Dispatch<React.SetStateAction<SubComment[number]>>,
  setSetCurrentSubComment: (setSubComment: any) => void
}

export type ModalState = {
  isModalOpen: boolean;
  onCloseModal: () => void;
}

type Props = {
  children: ((props: ModalState) => React.ReactNode) | React.ReactNode,
}

export const ReplyContext = createContext<ReplyContextType>({
  setState: () => { },
  setCurrentSubComment: () => { },
  setSetCurrentSubComment: () => () => { }
});

export const useReply = () => useContext(ReplyContext);



export default function ReplyProvider(props: Props) {
  const [state, setState] = useState<State>()
  const [setCurrentSubComment, setSetCurrentSubComment] = useState<ReplyContextType['setCurrentSubComment']>(() => { })

  const isModalOpen = !!(state?.profile && state?.parent_id);

  const onCloseModal = () => {
    setState(undefined)
  }
console.log(setCurrentSubComment)
  return (
    <ReplyContext.Provider
      value={{
        state,
        setState,
        setCurrentSubComment,
        setSetCurrentSubComment,
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