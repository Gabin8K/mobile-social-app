/* eslint-disable import/no-unresolved */

import nodemailer from 'npm:nodemailer@6.9.10'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseConnection = () => createClient(
  Deno.env.get('SB_URL') ?? '',
  Deno.env.get('SB_KEY') ?? ''
)


const transport = nodemailer.createTransport({
  host: Deno.env.get('SMTP_HOSTNAME')!,
  port: Number(Deno.env.get('SMTP_PORT')!),
  secure: Boolean(Deno.env.get('SMTP_SECURE')!),
  auth: {
    user: Deno.env.get('SMTP_USERNAME')!,
    pass: Deno.env.get('SMTP_PASSWORD')!
  }
})

async function sendEmail(to: string, subject: string, html: string) {
  return await transport.sendMail({
    from: Deno.env.get('SMTP_FROM')!,
    to,
    subject,
    html
  })
}


const mailer = {
  sendEmail
}


export default {
  mailer,
  supabaseConnection
}
