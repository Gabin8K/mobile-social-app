/* eslint-disable import/no-unresolved */
import { Application, Context, Router } from 'https://deno.land/x/oak@v11.1.0/mod.ts'
import common from './common.ts';


const app = new Application()
const router = new Router()
const authRouter = new Router()
const supabase = common.supabaseConnection()


authRouter
  .post('/reset-password', async (ctx: Context) => {
    const body = await ctx.request.body({ type: 'json' }).value
    try {
      if (!body.email) throw new Error('Email is required');
      const { data } = await supabase.from('profiles').select('*').eq('email', body.email)
      const user = data?.[0]

      if (!user) throw new Error('User not found')

      const code = Math.floor(10000 + Math.random() * 90000).toString()
      await common.mailer.sendEmail(user.email, 'Reset Password',
        `<h1>Reset Password</h1>
      <p>To reset password, please use the code below in the app Comment's:</p>
      <h2>${code}</h2>
    `)
      await supabase.from('reset_password').insert({ email: user.email, code })
      ctx.response.body = { message: 'Please check your email' }

    } catch (err) {
      ctx.response.status = 400
      ctx.response.body = { message: err.message }
    }
  })
  .post('/confirm-reset-password', async (ctx: Context) => {
    const body = await ctx.request.body({ type: 'json' }).value
    try {
      if (!body.email) throw new Error('Email is required')
      if (!body.code) throw new Error('Code is required')
      if (!body.password) throw new Error('Password is required')

      const { data } = await supabase.from('reset_password').select('*')
      .eq('email', body.email)
      .eq('code', body.code)
      
      const reset = data?.[0]

      if (!reset) throw new Error('Validation code not found')
      if (reset.code !== body.code) throw new Error('Invalid code')

      const response = await supabase.from('profiles').select('*').eq('email', body.email)
      const user = response.data?.[0]
      await supabase.auth.admin.updateUserById(user.id, { password: body.password })
      await supabase.from('reset_password').delete().eq('email', body.email)

      ctx.response.body = { message: 'Password updated' }

    } catch (error) {
      ctx.response.status = 400
      ctx.response.body = { message: error.message }
    }
  })



router.use('/auth', authRouter.routes())

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen()
