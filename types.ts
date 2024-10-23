
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

export type ConfirmResetPassword = {
  email: string,
  code: string,
  password: string,
}

export type SupabaseFile = {
  uri: any,
  name: string,
  type: string,
}

export type Setting = {
  has_push_token?: boolean,
}

export interface CommentNotification {
  old_comment_id: string,
  old_post_id: string,
  new_comment_id: string,
  type: 'post' | 'comment',
}