import { useContext } from 'react';
import { ToastContext } from '@/providers/ToastProvider';


export default function useToast() {
  const { message } = useContext(ToastContext)

  return {
    message
  }
}