export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export const FAQS: FAQ[] = [
  {
    id: '1',
    question: 'Is my identity really anonymous?',
    answer:
      'Yes. Seekers use an anonymous display name and illustrated avatar. Listeners never see your phone number, real name, or photo.',
  },
  {
    id: '2',
    question: 'How does billing work?',
    answer:
      'You are charged per minute based on the session type (chat, voice, or video). Your wallet balance is debited automatically during active sessions.',
  },
  {
    id: '3',
    question: 'What happens when my balance runs out?',
    answer:
      'You will receive a low-balance warning. When your balance reaches zero, the session ends automatically and you can recharge to continue.',
  },
  {
    id: '4',
    question: 'How do I become a Listener?',
    answer:
      'Select "I want to become a Listener" during signup, complete the onboarding steps including ID verification, and wait for approval.',
  },
  {
    id: '5',
    question: 'Can I report or block someone?',
    answer:
      'Yes. During any session, tap the report icon, select a reason, and submit. The session will end and the user will be blocked.',
  },
  {
    id: '6',
    question: 'Is safeTalk a replacement for therapy?',
    answer:
      'No. safeTalk provides peer emotional support, not professional mental health treatment. If you are in crisis, please contact emergency services.',
  },
];
