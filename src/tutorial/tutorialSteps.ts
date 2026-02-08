export type StepType = 'info' | 'action-required' | 'post-action';

export type HighlightTarget = 'rules' | 'score' | 'input' | null;

export interface TutorialStep {
  type: StepType;
  highlight: HighlightTarget;
  title: string;
  description: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    type: 'info',
    highlight: null,
    title: 'Oh, you\u2019re new here?',
    description:
      'Let me show you how this works. I\u2019ll keep it quick.',
  },
  {
    type: 'info',
    highlight: 'rules',
    title: 'Number Requirements',
    description:
      'See that? That\u2019s a number requirement. Find a number that satisfies it and I\u2019ll add another. And another. You get the idea.',
  },
  {
    type: 'info',
    highlight: 'rules',
    title: 'Pass or Fail',
    description:
      'Checkmark means you nailed it. X means you didn\u2019t. You need ALL checkmarks \u2014 no partial credit here.',
  },
  {
    type: 'info',
    highlight: 'rules',
    title: 'Points & Time',
    description:
      'The number on the right? That\u2019s how many points this requirement is worth \u2014 and it\u2019s ticking down. Guess wrong and I\u2019ll halve your remaining time. No pressure.',
  },
  {
    type: 'info',
    highlight: 'score',
    title: 'Score Bar',
    description:
      '"Best" is your all-time high. "Score" is how you\u2019re doing right now. "Valid" shows how many numbers still work \u2014 enjoy it while it lasts.',
  },
  {
    type: 'info',
    highlight: 'input',
    title: 'The Calculator',
    description:
      'Type your number here or use your keyboard. Hit "OK" to submit, "C" to clear. You\u2019ll need both.',
  },
  {
    type: 'action-required',
    highlight: 'input',
    title: 'Alright, enough talk.',
    description:
      'Enter any number from 1 to 999 and hit "OK".',
  },
  {
    type: 'post-action',
    highlight: 'rules',
    title: 'And just like that\u2026',
    description:
      'A new requirement \u2014 and your last answer already fails it. Funny how that works, isn\u2019t it?',
  },
  {
    type: 'post-action',
    highlight: 'score',
    title: 'Valid Numbers',
    description:
      'See how "Valid" dropped? Fewer numbers work now. It only gets worse from here.',
  },
  {
    type: 'action-required',
    highlight: 'input',
    title: 'Try again.',
    description:
      'Find a number that passes both requirements. Still think this is easy?',
  },
  {
    type: 'post-action',
    highlight: 'rules',
    title: 'Getting the pattern?',
    description:
      'Every correct answer makes things harder. That\u2019s the deal.',
  },
  {
    type: 'info',
    highlight: null,
    title: 'That\u2019s the gist.',
    description:
      'In the real game, wrong answers cost you time and points don\u2019t wait around. Good luck \u2014 you\u2019ll need it.',
  },
];
