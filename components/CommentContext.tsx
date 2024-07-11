import { createContext, useContext, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Tables } from "@/services/type";
import { ListOfPostQuery } from "@/services/supabase";

type CommentContextType = {
  post?:  ListOfPostQuery[number],
  profile?: Tables<'profiles'>,
  bottomSheetRef?: React.RefObject<BottomSheetModal>,
  setPost: (post: CommentContextType['post']) => void,  
  setProfile: (profile: CommentContextType['profile']) => void
}

type Props = {
  children: React.ReactNode,
  bottomSheetRef: React.RefObject<BottomSheetModal>
}

export const CommentContext = createContext<CommentContextType>({
  setPost: () => { },
  setProfile: () => { },
});
export const useComment = () => useContext(CommentContext);

export default function CommentProvider(props: Props) {
  const [profile, setProfile] = useState<Tables<'profiles'>>()
  const [post, setPost] = useState< ListOfPostQuery[number]>()

  return (
    <CommentContext.Provider
      value={{
        post,
        profile,
        setPost,
        setProfile,
        bottomSheetRef: props.bottomSheetRef,
      }}
    >
      {props.children}
    </CommentContext.Provider>
  )
}