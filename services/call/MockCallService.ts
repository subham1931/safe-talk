import { CallEventListener, CallState, SessionType } from '@/types';
import { CallService } from './CallService';

/**
 * MockCallService — fully working demo implementation.
 * Simulates connect/mute/disconnect with real elapsed timer.
 * Replace with AgoraCallService when API keys are available.
 */
export class MockCallService implements CallService {
  private state: CallState = {
    status: 'idle',
    isMuted: false,
    isSpeakerOn: false,
    isCameraOn: true,
    isFrontCamera: true,
    elapsedSeconds: 0,
  };

  private listeners: CallEventListener[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private connectTimeout: ReturnType<typeof setTimeout> | null = null;

  async startCall(_sessionId: string, type: SessionType): Promise<void> {
    this.state = {
      ...this.state,
      status: 'connecting',
      isCameraOn: type === 'video',
      elapsedSeconds: 0,
    };
    this.emit({ type: 'connecting' });

    await new Promise<void>((resolve) => {
      this.connectTimeout = setTimeout(() => {
        this.state.status = 'connected';
        this.startTimer();
        this.emit({ type: 'connected' });
        resolve();
      }, 1500);
    });
  }

  async endCall(): Promise<void> {
    this.stopTimer();
    if (this.connectTimeout) clearTimeout(this.connectTimeout);
    this.state.status = 'disconnected';
    this.emit({ type: 'disconnected' });
  }

  toggleMute(): boolean {
    this.state.isMuted = !this.state.isMuted;
    this.emit({ type: 'mute_changed', payload: { isMuted: this.state.isMuted } });
    return this.state.isMuted;
  }

  toggleSpeaker(): boolean {
    this.state.isSpeakerOn = !this.state.isSpeakerOn;
    this.emit({ type: 'speaker_changed', payload: { isSpeakerOn: this.state.isSpeakerOn } });
    return this.state.isSpeakerOn;
  }

  toggleCamera(): boolean {
    this.state.isCameraOn = !this.state.isCameraOn;
    this.emit({ type: 'camera_changed', payload: { isCameraOn: this.state.isCameraOn } });
    return this.state.isCameraOn;
  }

  flipCamera(): boolean {
    this.state.isFrontCamera = !this.state.isFrontCamera;
    this.emit({ type: 'camera_changed', payload: { isFrontCamera: this.state.isFrontCamera } });
    return this.state.isFrontCamera;
  }

  getState(): CallState {
    return { ...this.state };
  }

  addEventListener(listener: CallEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.state.elapsedSeconds += 1;
    }, 1000);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private emit(event: Parameters<CallEventListener>[0]) {
    this.listeners.forEach((l) => l(event));
  }
}

export const callService = new MockCallService();
