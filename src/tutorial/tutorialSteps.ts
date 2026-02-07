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
    title: 'Welcome!',
    description:
      'This quick tutorial will walk you through the game. Click "Continue" to step through each part.',
  },
  {
    type: 'info',
    highlight: 'rules',
    title: 'The Rules',
    description:
      'Rules appear here. You start with one rule, and every time you find a number that passes all rules, a new one is added.',
  },
  {
    type: 'info',
    highlight: 'rules',
    title: 'Pass or Fail',
    description:
      'Each rule shows a checkmark when your number passes it, or an X when it fails. You need ALL rules to show a checkmark.',
  },
  {
    type: 'info',
    highlight: 'rules',
    title: 'Points',
    description:
      'The number on the right shows how many points the current rule is worth. Act fast — points decrease over time!',
  },
  {
    type: 'info',
    highlight: 'score',
    title: 'Score Bar',
    description:
      '"Best" is your high score, "Score" is your current total, and "Valid" shows how many numbers still satisfy all rules.',
  },
  {
    type: 'info',
    highlight: 'input',
    title: 'The Calculator',
    description:
      'Type numbers here (or use your keyboard). Press "=" to submit your answer. Press "C" to clear.',
  },
  {
    type: 'action-required',
    highlight: 'input',
    title: 'Your Turn!',
    description:
      'Try it out! Enter any number between 1 and 999 and press "=" to submit it.',
  },
  {
    type: 'post-action',
    highlight: 'rules',
    title: 'New Rule!',
    description:
      'A new rule appeared — and your last answer fails it! Now you need to find a number that satisfies both rules.',
  },
  {
    type: 'post-action',
    highlight: 'score',
    title: 'Valid Numbers',
    description:
      'Notice the "Valid" count dropped. As more rules are added, fewer numbers work. Keep an eye on this!',
  },
  {
    type: 'info',
    highlight: null,
    title: "You're Ready!",
    description:
      'In the real game, points tick down over time so think fast! Good luck — how many rules can you beat?',
  },
];
