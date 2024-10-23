export interface Notification {
  id: string,
  user_id: string,
  body: string,
}

export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
  record: Notification,
  schema: 'public',
  old_record: Notification | null,
}

export interface CommentNotification {
  old_comment_id: string,
  old_post_id: string,
  new_comment_id: string,
  type: 'post' | 'comment',
}