export type UserRole = 'seeker' | 'listener';
export type ListenerStatus = 'pending' | 'approved' | 'rejected';
export type SessionType = 'chat' | 'call' | 'video';
export type SessionStatus = 'pending' | 'active' | 'ended' | 'declined';
export type TransactionType = 'recharge' | 'debit' | 'earning';

export interface Profile {
  id: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  is_age_verified: boolean;
  anonymous_name?: string;
  avatar_id?: string;
  avatar_url?: string | null;
  gender?: string;
  date_of_birth?: string;
  wallet_balance: number;
  blocked_user_ids: string[];
  onboarding_complete: boolean;
  notification_preferences?: Record<string, boolean>;
  language_preference?: string;
}

export interface ListenerProfile {
  id: string;
  display_name: string;
  status: ListenerStatus;
  bio?: string;
  languages: string[];
  tags: string[];
  rate_per_min_chat: number;
  rate_per_min_call: number;
  rate_per_min_video: number;
  is_online: boolean;
  rating: number;
  rating_count: number;
  today_minutes: number;
  daily_target_minutes: number;
  id_document_url?: string;
  selfie_url?: string;
  avatar_url?: string;
  gender?: string;
}

export interface Session {
  id: string;
  seeker_id: string;
  listener_id: string;
  type: SessionType;
  status: SessionStatus;
  category_tag?: string;
  started_at: string;
  ended_at?: string;
  rate_per_min: number;
  total_amount: number;
  total_minutes: number;
  seeker_rating?: number;
  seeker_feedback?: string;
}

export interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description?: string;
  created_at: string;
  session_id?: string;
}

export interface RechargePack {
  id: string;
  amount: number;
  bonus: number;
  label: string;
}

export interface CallState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';
  isMuted: boolean;
  isSpeakerOn: boolean;
  isCameraOn: boolean;
  isFrontCamera: boolean;
  elapsedSeconds: number;
}

export type CallEventType =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'mute_changed'
  | 'speaker_changed'
  | 'camera_changed';

export interface CallEvent {
  type: CallEventType;
  payload?: Record<string, unknown>;
}

export type CallEventListener = (event: CallEvent) => void;
