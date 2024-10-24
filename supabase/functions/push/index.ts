/* eslint-disable import/no-unresolved */

import serviceAccount from '../service-account.json' with { type: 'json' }
import common from '../common.ts'
import { CommentNotification, WebhookPayload } from './type.ts';


const supabase = common.supabaseConnection()
const headers = new Headers({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
})


const pushRouter = {
  notification: async (request: Request) => {
    const payload: WebhookPayload = await request.json()
    // TODO: Implement your own logic here
    return new Response(
      JSON.stringify({ ...payload }),
      { headers }
    )
  },

  replyComment: async (request: Request) => {
    const payload: CommentNotification = await request.json()
    try {
      const table = `old_${payload.type}_id`;
      const key_value = payload[table as keyof CommentNotification];
      const old_comment = await supabase.from(payload.type).select(
        `
        id,
        profiles(push_token) 
      `
      ).eq('id', (key_value) as string).single();
      const new_comment = await supabase.from('comment').select(
        `
        id,
        content,
        profiles(id, email, display_name)
        
      `).eq('id', payload.new_comment_id).single();

      if (old_comment.error || new_comment.error) throw new Error('Comment or Post not found')

      const profiles = (old_comment.data.profiles as any) as typeof old_comment.data.profiles[number];
      if (!profiles.push_token) throw new Error('User not allow push notification');

      const fcmToken = profiles.push_token as string
      const accessToken = await common.fcm.getAccessToken({
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      })

      const res = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title: (new_comment.data.profiles as any).display_name,
              body: new_comment.data.content,
            },
            data: {
              categoryId: 'reply_comment',
            }
          },
        }),
      })
        .then(res => res.json())
        .catch(err => { throw new Error(err) })

      return new Response(
        JSON.stringify(res),
        {
          headers,
          status: 200,
        }
      )

    } catch (error) {
      return new Response(
        JSON.stringify({ message: error.message || error }),
        {
          headers,
          status: 400,
        }
      )
    }
  }
}




Deno.serve(async (request: Request) => {
  const { url, method } = request;

  const pathname = new URL(url).pathname;
  const pathnameRouter = pathname.replace('/push', '');

  try {
    if (pathnameRouter === '/webhook/notification') {
      if (method === 'POST') {
        return await pushRouter.notification(request)
      }
    }

    if (pathnameRouter === '/reply_comment') {
      if (method === 'POST') {
        return await pushRouter.replyComment(request)
      }
    }

    throw new Error('Not Allowed Method')
  } catch (error) {
    return new Response(
      JSON.stringify({ message: error.message || error }),
      { headers }
    )
  }
})