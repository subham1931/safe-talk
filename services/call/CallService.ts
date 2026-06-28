import { CallEvent, CallEventListener, CallState, SessionType } from '@/types';

/**
 * CallService interface — swap MockCallService for AgoraCallService / TwilioCallService later.
 * Real SDK integration: replace import in services/call/index.ts only.
 */
export interface CallService {
  startCall(sessionId: string, type: SessionType): Promise<void>;
  endCall(): Promise<void>;
  toggleMute(): boolean;
  toggleSpeaker(): boolean;
  toggleCamera(): boolean;
  flipCamera(): boolean;
  getState(): CallState;
  addEventListener(listener: CallEventListener): () => void;
}
