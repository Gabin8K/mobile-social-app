
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