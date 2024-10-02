import React, { createContext, useContext, useState } from "react";
import { Tables } from "@/services/database.types";

type State = {
  parent_id?: string,
  profile?: Tables<'profiles'>,
  currentSubComment?: Tables<'comment'>,
}

type ReplyContextType = {
  state?: State,
  setState: (state?: State) => void,
  closeModal: () => void,
}

export type ModalState = {
  isModalOpen: boolean;
  closeModal: () => void;
}

type Props = {
  children: ((props: ModalState) => React.ReactNode) | React.ReactNode,
}

export const ReplyContext = createContext<ReplyContextType>({
  setState: () => { },
  closeModal: () => { }
});

export const useReply = () => useContext(ReplyContext);



export default function ReplyProvider(props: Props) {
  const [state, setState] = useState<State>()

  const isModalOpen = !!(state?.profile && state?.parent_id);

  const closeModal = () => {
    setState(state => ({
      ...state,
      profile: undefined,
      parent_id: undefined
    }))
  }

  return (
    <ReplyContext.Provider
      value={{
        state,
        setState,
        closeModal
      }}
    >
      {typeof props.children === 'function' ?
        props.children({
          isModalOpen,
          closeModal
        }) :
        props.children
      }
    </ReplyContext.Provider>
  )
}