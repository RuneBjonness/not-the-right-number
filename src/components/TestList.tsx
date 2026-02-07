import { useEffect, useRef } from 'react';
import type { Test, TestResult } from '../engine/types';

interface TestListProps {
  activeTests: Test[];
  testResults: TestResult[];
  levelScores: number[];
  potentialPoints: number;
}

function getPotentialColor(points: number): string {
  if (points > 10) return 'var(--chalk-green)';
  if (points > 5) return 'var(--chalk-yellow)';
  return 'var(--chalk-red)';
}

export function TestList({ activeTests, testResults, levelScores, potentialPoints }: TestListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new rules are added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTests.length]);

  const getTestStatus = (testId: string): 'pending' | 'passed' | 'failed' => {
    const result = testResults.find((r) => r.test.id === testId);
    if (!result) return 'pending';
    return result.passed ? 'passed' : 'failed';
  };

  const getStatusIcon = (status: 'pending' | 'passed' | 'failed') => {
    switch (status) {
      case 'passed':
        return <span className="text-xl" style={{ color: 'var(--chalk-green)' }}>&#10003;</span>;
      case 'failed':
        return <span className="text-xl" style={{ color: 'var(--chalk-red)' }}>&#10007;</span>;
      default:
        return <span className="chalk-text opacity-50 text-xl">&#9675;</span>;
    }
  };

  const lastIndex = activeTests.length - 1;

  return (
    <div className="w-full max-w-sm" data-tutorial="rules">
      <div className="space-y-1">
        {activeTests.map((test, index) => {
          const status = getTestStatus(test.id);
          const isLatest = index === lastIndex;
          const isNew = isLatest && testResults.length > 0;

          return (
            <div
              key={test.id}
              className={`${isNew ? 'animate-chalk-appear' : ''} flex items-start gap-2 py-0.5`}
            >
              <div className="flex-shrink-0 w-6 text-center mt-0.5">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`chalk-text text-lg leading-snug ${isLatest ? 'font-semibold' : ''}`}>
                    {test.name}
                  </p>
                  {isLatest ? (
                    <span
                      className={`flex-shrink-0 text-lg font-bold chalk-text ${potentialPoints <= 5 ? 'animate-pulse' : ''}`}
                      style={{ color: getPotentialColor(potentialPoints) }}
                    >
                      +{potentialPoints}
                    </span>
                  ) : (
                    levelScores[index] !== undefined && (
                      <span
                        className="flex-shrink-0 text-lg chalk-text opacity-70"
                        style={{ color: 'var(--chalk-yellow)' }}
                      >
                        +{levelScores[index]}
                      </span>
                    )
                  )}
                </div>
                {isLatest && (
                  <p className="chalk-text opacity-60 text-base leading-snug mt-0.5">
                    {test.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
