import { supabase } from '@/lib/supabase';
import { Message } from '@/types';

// Realtime via Supabase — swap for dedicated chat service (Stream, Sendbird) later
export async function sendMessage(sessionId: string, senderId: string, text: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ session_id: sessionId, sender_id: senderId, text })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export function subscribeToMessages(sessionId: string, callback: (message: Message) => void) {
  return supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => callback(payload.new as Message)
    )
    .subscribe();
}
