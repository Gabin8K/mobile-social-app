import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, PostgrestError, QueryData } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { Tables } from './database.types';
import { CommentNotification, ConfirmResetPassword, LikeField, LikeParam, Page, Setting, SupabaseFile } from '@/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ADMIN_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})



export const createPost = async (post: Partial<Tables<'post'>>, file?: SupabaseFile) => {
  const { data, error } = await supabase.from('post').insert(post).select();

  if (file) {
    const _post = data?.[0] as Tables<'post'>;
    const response = await uploadFile(file, _post.user_id as string, _post.id as string)
    if (response.error) throw response.error;
    await supabase.from('post')
      .update({ image_path: response.data?.path as string })
      .eq('id', _post.id)
      .select()
  }
  return {
    data,
    error,
  };
}



type CommentArg = {
  comment: Partial<Tables<'comment'>>,
  type?: 'comment' | 'post'
};

export const createReply = async ({ comment, type }: CommentArg, file?: SupabaseFile) => {
  const { data, error } = await supabase.from('comment').insert(comment)
    .select();

  if (file) {
    const _comment = data?.[0] as SubComment[number];
    const response = await uploadFile(file, _comment.user_id as string, _comment.id as string)
    if (response.error) throw response.error;
    await supabase.from('comment')
      .update({ image_path: response.data?.path as string })
      .eq('id', _comment.id)
      .select()
  }
  try {
    const commentNotification: CommentNotification = {
      new_comment_id: data?.[0].id,
      old_comment_id: (type === 'post' ? null : comment.parent_id) as any,
      old_post_id: (type === 'comment' ? null : comment.post_id) as any,
      type: comment.post_id ? 'post' : 'comment',
    }
    console.log({ commentNotification })
    await sendCommentNotification(commentNotification)
  } catch (error) {
  }

  return {
    data: data?.[0] as Tables<'comment'>,
    error,
  };
}


export const updateLikes = async (param: LikeParam) => {
  const { like, isComment, ...body } = param;
  const key = isComment ? 'comment_id' : 'post_id';
  if (param.like) {
    const { error } = await supabase.from('likes').upsert(body)
    return { error }
  }
  const { error } = await supabase.from('likes')
    .delete()
    .eq('user_id', param.user_id)
    .eq(key, param[key])

  return { error }
}


const listOfPostByUserIdQuery = (user_id: string) => supabase.from('post').select(`
  id,
  content,
  created_at,
  image_path,
  profiles (
    id,
    email,
    display_name
  ),
  comment(
    id,
    parent_id,
    content,
    profiles (
      id,
      email,
      display_name
    )
  )
`, { count: 'exact' })
  .eq('user_id', user_id)
  .is('comment.parent_id', null)
  .order('created_at', { ascending: false });


const listOfPostQuery = supabase.from('post').select(`
  id,
  content,
  created_at,
  image_path,
  profiles (
    id,
    email,
    display_name
  ),
  comment(
    id,
    parent_id,
    content,
    profiles (
      id,
      email,
      display_name
    )
  )
`, { count: 'exact' })
  .is('comment.parent_id', null)
  .order('created_at', { ascending: false });


export const listOfPost = async (user_id: string, from: number, to: number) => {
  const { data, count, error } = await listOfPostQuery.range(from, to);

  if (!data) return { data: [], error }
  const mappingWithLike = data?.map(async (datum) => ({
    ...datum,
    count,
    image_url: datum.image_path ? (await supabase.storage.from('post_bucket').createSignedUrl(datum.image_path, 60 * 60)).data?.signedUrl : undefined,
    like_count: (await supabase.from('likes').select('*', { count: 'exact' }).eq('post_id', datum.id)).count,
    is_liked: !!(
      await supabase.from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', datum.id)
        .eq('user_id', user_id)
    ).count
  }))
  return {
    data: await Promise.all(mappingWithLike) as ListOfPostQuery,
    error,
  };
}


export type ListOfPostQuery = (QueryData<ReturnType<typeof listOfPostByUserIdQuery>>[number] & LikeField & {
  count?: number,
  image_url?: string,
})[];

export const listOfPostByUserId = async (user_id: string, from: number, to: number) => {
  const { data, count, error } = await listOfPostByUserIdQuery(user_id).range(from, to);

  if (!data) return { data: [], error }
  const mappingWithLike = data?.map(async (datum) => ({
    ...datum,
    count,
    image_url: datum.image_path ? (await supabase.storage.from('post_bucket').createSignedUrl(datum.image_path, 60 * 60)).data?.signedUrl : undefined,
    like_count: (await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', datum.id)).count,
    is_liked: !!(
      await supabase.from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', datum.id)
        .eq('user_id', user_id)
    ).count
  }))
  return {
    data: await Promise.all(mappingWithLike) as ListOfPostQuery,
    error,
  };
}





export type SubComment = GetRecursiveComment['data'];
export type GetRecursiveComment = {
  data: {
    id: string,
    user_id: string,
    parent_id: string,
    content: string,
    image_url?: string,
    created_at: Date,
    like_count: number,
    is_liked: boolean,
    likes: string,
    count: number,
    child: {
      count: number,
      hasChild?: boolean
    },
    display_name: string,
    email: string
  }[],
  error: PostgrestError | null,
};


export const getRecursiveCommentById = async (user_id: string, parent_id: string, page: Page): Promise<GetRecursiveComment> => {
  const { data, error } = await supabase.rpc('recursive_comment', {
    param_parent_id: parent_id,
    param_start: page.from,
    param_take: page.take,
  })
  const mappingWithCount = data?.map(async (datum: any) => ({
    ...datum,
    image_url: datum.image_path ? (await supabase.storage.from('post_bucket').createSignedUrl(datum.image_path, 60 * 60)).data?.signedUrl : undefined,
    like_count: (await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('comment_id', datum.id)).count,
    is_liked: !!(
      await supabase.from('likes')
        .select('*', { count: 'exact' })
        .eq('comment_id', datum.id)
        .eq('user_id', user_id)
    ).count,
    child: await (async () => {
      const count = (await supabase.from('comment').select('*', { count: 'exact', head: true }).eq('parent_id', datum.id)).count
      const hasChild = (count ?? 0) > 0
      return {
        count,
        hasChild
      }
    })(),
  }))

  return {
    data: await Promise.all(mappingWithCount),
    error,
  };
}


export const getParentRecursiveCommentById = async (user_id: string, post_id: string, page: Page): Promise<GetRecursiveComment> => {
  const { data, error } = await supabase.rpc('parent_recursive_comment', {
    param_post_id: post_id,
    param_start: page.from,
    param_take: page.take,
  })
  const mappingWithCount = data?.map(async (datum: any) => ({
    ...datum,
    image_url: datum.image_path ? (await supabase.storage.from('post_bucket').createSignedUrl(datum.image_path, 60 * 60)).data?.signedUrl : undefined,
    like_count: (await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('comment_id', datum.id)).count,
    is_liked: !!(
      await supabase.from('likes')
        .select('*', { count: 'exact' })
        .eq('comment_id', datum.id)
        .eq('user_id', user_id)
    ).count,
    child: await (async () => {
      const count = (await supabase.from('comment').select('*', { count: 'exact', head: true }).eq('parent_id', datum.id)).count
      const hasChild = (count ?? 0) > 0
      return {
        count,
        hasChild
      }
    })(),
  }))

  return {
    data: await Promise.all(mappingWithCount),
    error,
  };
}



export const getRecursiveCommentByPostId = async (user_id: string, post_id: string, page: Page): Promise<GetRecursiveComment> => {
  const { data, error } = await supabase.rpc('comment_by_post', {
    param_post_id: post_id,
    param_start: page.from,
    param_take: page.take,
  })
  const mappingWithCount = data?.map(async (datum: any) => ({
    ...datum,
    image_url: datum.image_path ? (await supabase.storage.from('post_bucket').createSignedUrl(datum.image_path, 60 * 60)).data?.signedUrl : undefined,
    like_count: (await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('comment_id', datum.id)).count,
    is_liked: !!(
      await supabase.from('likes')
        .select('*', { count: 'exact' })
        .eq('comment_id', datum.id)
        .eq('user_id', user_id)
    ).count,
    child: await (async () => {
      const count = (await supabase.from('comment').select('*', { count: 'exact', head: true }).eq('parent_id', datum.id)).count
      const hasChild = (count ?? 0) > 0
      return {
        count,
        hasChild,
      }
    })()
  }))

  return {
    data: await Promise.all(mappingWithCount),
    error,
  };
}



export const resetPassword = async (email: string) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_AUTH_URL}/reset-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    }
  );
  if (response.ok) {
    const data = await response.json();
    return { data, error: null }
  }
  const error = await response.json();
  return { data: null, error }
}



export const confirmPassword = async (body: ConfirmResetPassword) => {
  const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_AUTH_URL}/confirm-reset-password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );
  if (response.ok) {
    const data = await response.json();
    return { data, error: null }
  }
  const error = await response.json();
  return { data: null, error }
}



export const saveDeviceToken = async (user_id: string, token: string) => {
  const setting: Setting = JSON.parse(await AsyncStorage.getItem('setting') ?? '{}');

  if (setting.has_push_token) {
    return {
      data: null,
      error: null
    }
  }
  const { data, error } = await supabase.from('profiles')
    .update({ push_token: token })
    .eq('id', user_id);
  if (!error) {
    await AsyncStorage.setItem('setting', JSON.stringify({ ...setting, has_push_token: true }))
  }
  return {
    data,
    error,
  }
}



export const uploadFile = async (file: SupabaseFile, user_id: string, post_id: string) => {
  const formData = new FormData();
  formData.append('file', file as any);

  const { data, error } = await supabase
    .storage
    .from('post_bucket')
    .upload(`user/${post_id}-${user_id}`, formData);
  return {
    data,
    error,
  };
}



export const sendCommentNotification = async (comment: CommentNotification) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_PUSH_URL}/reply-comment`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    })

  if (response.ok) {
    const data = await response.json();
    return { data, error: null }
  }
  const error = await response.json();
  return { data: null, error }
}



export default supabase;
