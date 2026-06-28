export const CATEGORIES = [
  'All',
  'Breakup',
  'Relationship',
  'Loneliness',
  'Anxiety',
  'Career',
  'Family',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const EXPERIENCE_TAGS = [
  'Breakup',
  'Relationship',
  'Loneliness',
  'Anxiety',
  'Career',
  'Family',
  'Grief',
  'Self-esteem',
  'Work stress',
  'Parenting',
] as const;

export const LANGUAGES = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Kannada',
  'Malayalam',
] as const;

export const AWARENESS_BANNERS = [
  {
    id: '1',
    title: "You're not alone",
    subtitle: '1 in 2 people feel lonely at some point — reaching out is brave.',
    colorKey: 'primary' as const,
  },
  {
    id: '2',
    title: 'Judgment-free zone',
    subtitle: 'Talk freely. Your identity stays completely anonymous.',
    colorKey: 'secondary' as const,
  },
  {
    id: '3',
    title: 'Available 24/7',
    subtitle: 'Listeners are here whenever you need someone to talk to.',
    colorKey: 'primaryDark' as const,
  },
];
