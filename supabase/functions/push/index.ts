/* eslint-disable import/no-unresolved */

import serviceAccount from '../service-account.json' with { type: 'json' }
import common from '../common.ts'

interface Notification {
  id: string,
  user_id: string,
  body: string,
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE',
  table: string,
  record: Notification,
  schema: 'public',
  old_record: Notification | null,
}

const supabase = common.supabaseConnection()
const headers = {
  'Content-Type': 'application/json'
}



Deno.serve(async (req: Request) => {
  const payload: WebhookPayload = await req.json()
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', payload.record.user_id)
      .single()

    if (!data) throw new Error("User not found");

    const fcmToken = data.expo_push_token as string
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
            title: `Notification from Supabase`,
            body: payload.record.body,
          },
        },
      }),
    })
      .then(res => res.json())
      .catch(err => { throw new Error(err) })

    return new Response(JSON.stringify(res), {
      status: 202,
      headers,
    })
  } catch (err) {
    return new Response(JSON.stringify(String(err.message || err)), {
      status: 500,
      headers,
    })
  }
})