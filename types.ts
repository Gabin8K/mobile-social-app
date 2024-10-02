
export type Page = {
  from: number,
  take: number,
  count?: number,
}

export type LikeParam = {
  user_id: string,
  post_id: string | null,
  comment_id: string | null,
  like: boolean,
  isComment: boolean,
}


export type LikeState = {
  count: number,
  isLiked: boolean,
  loading: boolean,
}

export type LikeField = {
  like_count: number,
  is_liked: boolean,
}