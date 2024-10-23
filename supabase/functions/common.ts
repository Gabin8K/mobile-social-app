/* eslint-disable import/no-unresolved */

import nodemailer from 'npm:nodemailer@6.9.10'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

type AccessTokenParams = {
  clientEmail: string
  privateKey: string
}

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


const getAccessToken = ({ clientEmail, privateKey }: AccessTokenParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens!.access_token!)
    })
  })
}



const mailer = {
  sendEmail
}

const fcm = {
  getAccessToken
}


export default {
  supabaseConnection,
  mailer,
  fcm
}
