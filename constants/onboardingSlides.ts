import { Ionicons } from '@expo/vector-icons';

export type OnboardingIconName = keyof typeof Ionicons.glyphMap;

export type HeroAvatar = {
  type: 'avatar';
  uri: string;
  size: number;
  top: number;
  left: number;
  rotate?: string;
};

export type HeroIcon = {
  type: 'icon';
  name: OnboardingIconName;
  size: number;
  top: number;
  left: number;
  bg: string;
  color: string;
  rotate?: string;
};

export type HeroEmoji = {
  type: 'emoji';
  emoji: string;
  size: number;
  top: number;
  left: number;
  bg: string;
  rotate?: string;
};

export type HeroElement = HeroAvatar | HeroIcon | HeroEmoji;

export type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  blobColor: string;
  elements: HeroElement[];
};

const AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461fadead4d?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=face',
];

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Talk freely, stay anonymous',
    subtitle: 'Share what is on your mind without revealing who you are.',
    gradient: ['#5B4B8A', '#8B6CB0'],
    blobColor: 'rgba(255,255,255,0.08)',
    elements: [
      { type: 'avatar', uri: AVATARS[0], size: 72, top: 18, left: 28, rotate: '-8deg' },
      { type: 'avatar', uri: AVATARS[1], size: 88, top: 8, left: 52, rotate: '6deg' },
      { type: 'avatar', uri: AVATARS[2], size: 64, top: 42, left: 8, rotate: '-4deg' },
      { type: 'avatar', uri: AVATARS[3], size: 70, top: 38, left: 68, rotate: '10deg' },
      { type: 'icon', name: 'shield-checkmark', size: 28, top: 52, left: 42, bg: '#FFFFFF', color: '#5B4B8A', rotate: '-12deg' },
      { type: 'emoji', emoji: '💜', size: 26, top: 22, left: 78, bg: '#FFFFFF', rotate: '8deg' },
    ],
  },
  {
    id: '2',
    title: 'Chat, call, or video',
    subtitle: 'Connect with caring listeners via text, voice, or video — your choice.',
    gradient: ['#2A9D8F', '#48CAE4'],
    blobColor: 'rgba(255,255,255,0.1)',
    elements: [
      { type: 'avatar', uri: AVATARS[4], size: 76, top: 14, left: 22, rotate: '-6deg' },
      { type: 'avatar', uri: AVATARS[5], size: 82, top: 10, left: 58, rotate: '5deg' },
      { type: 'icon', name: 'chatbubbles', size: 30, top: 48, left: 12, bg: '#FFFFFF', color: '#E07A5F', rotate: '-10deg' },
      { type: 'icon', name: 'call', size: 26, top: 20, left: 72, bg: '#FFFFFF', color: '#2A9D8F', rotate: '12deg' },
      { type: 'icon', name: 'videocam', size: 28, top: 50, left: 68, bg: '#FFFFFF', color: '#457B9D', rotate: '6deg' },
      { type: 'emoji', emoji: '👍', size: 28, top: 32, left: 44, bg: '#FFFFFF', rotate: '-8deg' },
    ],
  },
  {
    id: '3',
    title: 'Judgment-free support',
    subtitle: 'Vetted listeners who have been through tough times and are here for you.',
    gradient: ['#C1666B', '#E07A5F'],
    blobColor: 'rgba(255,255,255,0.09)',
    elements: [
      { type: 'avatar', uri: AVATARS[2], size: 80, top: 12, left: 34, rotate: '4deg' },
      { type: 'avatar', uri: AVATARS[0], size: 68, top: 36, left: 10, rotate: '-10deg' },
      { type: 'avatar', uri: AVATARS[3], size: 72, top: 40, left: 66, rotate: '8deg' },
      { type: 'icon', name: 'heart', size: 32, top: 18, left: 68, bg: '#FFFFFF', color: '#C1666B', rotate: '14deg' },
      { type: 'icon', name: 'hand-left', size: 26, top: 52, left: 44, bg: '#FFFFFF', color: '#E07A5F', rotate: '-6deg' },
      { type: 'emoji', emoji: '🤝', size: 24, top: 28, left: 14, bg: '#FFFFFF', rotate: '6deg' },
    ],
  },
  {
    id: '4',
    title: 'Your safe space',
    subtitle: 'Pay only for the time you use. Block and report anytime.',
    gradient: ['#3D405B', '#5C6BC0'],
    blobColor: 'rgba(255,255,255,0.08)',
    elements: [
      { type: 'avatar', uri: AVATARS[1], size: 74, top: 16, left: 18, rotate: '-5deg' },
      { type: 'avatar', uri: AVATARS[4], size: 86, top: 8, left: 50, rotate: '7deg' },
      { type: 'avatar', uri: AVATARS[5], size: 66, top: 44, left: 72, rotate: '-8deg' },
      { type: 'icon', name: 'lock-closed', size: 28, top: 46, left: 28, bg: '#FFFFFF', color: '#3D405B', rotate: '10deg' },
      { type: 'icon', name: 'flag', size: 24, top: 24, left: 76, bg: '#FFFFFF', color: '#5C6BC0', rotate: '-12deg' },
      { type: 'emoji', emoji: '🛡️', size: 30, top: 38, left: 48, bg: '#FFFFFF', rotate: '4deg' },
    ],
  },
];
