export const AVATARS = [
  { id: 'cloud', emoji: '☁️', color: '#E0F2FE', darkColor: '#1E2830' },
  { id: 'leaf', emoji: '🍃', color: '#DCFCE7', darkColor: '#1E2A22' },
  { id: 'moon', emoji: '🌙', color: '#EDE9FE', darkColor: '#2A2535' },
  { id: 'star', emoji: '⭐', color: '#FEF9C3', darkColor: '#2A2820' },
  { id: 'heart', emoji: '💜', color: '#FCE7F3', darkColor: '#2A2028' },
  { id: 'sun', emoji: '🌤️', color: '#FFEDD5', darkColor: '#2A241E' },
  { id: 'wave', emoji: '🌊', color: '#CFFAFE', darkColor: '#1A2830' },
  { id: 'flower', emoji: '🌸', color: '#FDF2F8', darkColor: '#2A2026' },
];

export function getAvatar(id?: string) {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export function getAvatarBackground(id: string | undefined, isDark: boolean) {
  const avatar = getAvatar(id);
  return isDark ? avatar.darkColor : avatar.color;
}

export function generateAnonymousName(): string {
  const adjectives = ['Calm', 'Brave', 'Gentle', 'Quiet', 'Warm', 'Kind', 'Soft', 'Hopeful'];
  const nouns = ['Cloud', 'River', 'Star', 'Breeze', 'Light', 'Echo', 'Dawn', 'Spark'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}
