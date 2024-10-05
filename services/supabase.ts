import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, PostgrestError, QueryData } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { Tables } from './database.types';
import { LikeField, LikeParam, Page } from '@/types';

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



export const createPost = async (post: Partial<Tables<'post'>>) => {
  const { data, error } = await supabase.from('post').insert(post);
  return {
    data,
    error,
  };
}



export const createComment = async (comment: Partial<Tables<'comment'>>) => {
  const { data, error } = await supabase.from('comment').insert(comment)
    .select();
  return {
    data,
    error,
  };
}


export const createRepy = async (comment: Partial<Tables<'comment'>>) => {
  const { data, error } = await supabase.from('comment').insert(comment)
    .select();
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
`)
  .eq('user_id', user_id)
  .is('comment.parent_id', null);


const listOfPostQuery = supabase.from('post').select(`
  id,
  content,
  created_at,
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
`)
  .is('comment.parent_id', null);


export const listOfPost = async (user_id: string, page: Page) => {
  const { data, error } = await listOfPostQuery.range(page.from, page.take);
  const count = await (await supabase.from('post').select('*', { count: 'exact', head: true })).count

  if (!data) return { data: [], error }
  const mappingWithLike = data?.map(async (datum) => ({
    ...datum,
    count,
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


export type ListOfPostQuery = (QueryData<ReturnType<typeof listOfPostByUserIdQuery>>[number] & LikeField & { count?: number })[];

export const listOfPostByUserId = async (user_id: string, page: Page) => {
  const { data, error } = await listOfPostByUserIdQuery(user_id);
  const count = await (await supabase.from('post').select('*', { count: 'exact', head: true })).count

  if (!data) return { data: [], error }
  const mappingWithLike = data?.map(async (datum) => ({
    ...datum,
    count,
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




export default supabase;
