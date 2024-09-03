import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, PostgrestError, QueryData } from '@supabase/supabase-js';
import { AppState } from 'react-native';
import { Tables } from './type';

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


export type Page = {
  from: number,
  take: number,
  count?: number,
}


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
    data: data,
    error,
  };
}


export const createRepy = async (comment: Partial<Tables<'comment'>>) => {
  const { data, error } = await supabase.from('comment').insert(comment)
    .select();
  return {
    data,
    error,
  };
}


const listOfPostQuery = supabase.from('post').select(`
  id,
  likes,
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


export type ListOfPostQuery = QueryData<typeof listOfPostQuery>;
export const listOfPost = async () => {
  const { data, error } = await listOfPostQuery;
  return {
    data,
    error,
  };
}





export type SubComment = GetRecursiveComment['data']
export type GetRecursiveComment = {
  data: {
    id: string,
    user_id: string,
    parent_id: string,
    content: string,
    created_at: Date,
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


export const getRecursiveCommentById = async (parent_id: string, page: Page): Promise<GetRecursiveComment> => {
  const { data, error } = await supabase.rpc('recursive_comment', {
    param_parent_id: parent_id,
    param_start: page.from,
    param_take: page.take,
  })
  const mappingWithCount = data?.map(async (datum: any) => ({
    ...datum,
    child: await (async () => {
      const count = (await supabase.from('comment').select('*', { count: 'exact' }).eq('parent_id', datum.id)).count
      const hasChild = !!(await supabase.from('comment').select('*', { count: 'exact' }).eq('parent_id', datum.id).limit(1)).count
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



export const getRecursiveCommentByPostId = async (post_id: string, page: Page): Promise<GetRecursiveComment> => {
  const { data, error } = await supabase.rpc('comment_by_post', {
    param_post_id: post_id,
    param_start: page.from,
    param_take: page.take,
  })
  const mappingWithCount = data?.map(async (datum: any) => ({
    ...datum,
    child: await (async () => {
      const count = (await supabase.from('comment').select('*', { count: 'exact' }).eq('parent_id', datum.id)).count
      const hasChild = !!(await supabase.from('comment').select('*', { count: 'exact' }).eq('parent_id', datum.id).limit(1)).count
      return {
        count,
        hasChild
      }
    })()
  }))

  return {
    data: await Promise.all(mappingWithCount),
    error,
  };
}




export default supabase;
