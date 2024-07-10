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

const listOfPostQuery = supabase.from('profiles').select(`
  id,
  display_name,
  post(
    id,
    content,
    created_at,
    comment(
      id,
      content,
      created_at
    )
  )
`);

export type ListOfPostQuery = QueryData<typeof listOfPostQuery>;

export const listOfPost = async () => {
  const { data, error } = await listOfPostQuery;
  return {
    data,
    error,
  };
}

export default supabase;
