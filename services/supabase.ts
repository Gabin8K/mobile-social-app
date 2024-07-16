import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, QueryData } from '@supabase/supabase-js';
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



const getComment = (post_id: string) => supabase.from('comment').select(`
  id,
  parent_id,
  content,
  likes,
  created_at,
  profiles (
    id,
    email,
    display_name
  )
`)
  .eq('post_id', post_id)
  .is('parent_id', null);

export type GetComment = QueryData<ReturnType<typeof getComment>>;

export const getCommentById = async (id: string) => {

  const { data, error } = await getComment(id);
  return {
    data,
    error,
  };
}




export default supabase;
