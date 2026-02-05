import { useEffect, useRef } from 'react';
import type { Test, TestResult } from '../engine/types';

interface TestListProps {
  activeTests: Test[];
  testResults: TestResult[];
}

export function TestList({ activeTests, testResults }: TestListProps) {
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
        return <span className="text-base" style={{ color: 'var(--chalk-green)' }}>&#10003;</span>;
      case 'failed':
        return <span className="text-base" style={{ color: 'var(--chalk-red)' }}>&#10007;</span>;
      default:
        return <span className="chalk-text opacity-50 text-base">&#9675;</span>;
    }
  };

  const lastIndex = activeTests.length - 1;

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-lg font-bold chalk-text-strong mb-1">
        Rules ({activeTests.length})
      </h2>
      <div className="space-y-0.5">
        {activeTests.map((test, index) => {
          const status = getTestStatus(test.id);
          const isLatest = index === lastIndex;
          const isNew = isLatest && testResults.length > 0;

          return (
            <div
              key={test.id}
              className={`${isNew ? 'animate-chalk-appear' : ''} flex items-start gap-2 py-0.5`}
            >
              <div className="flex-shrink-0 w-5 text-center mt-0.5">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`chalk-text text-sm leading-tight ${isLatest ? 'font-semibold' : ''}`}>
                  <span className="chalk-text opacity-40 text-xs mr-1">#{index + 1}</span>
                  {test.name}
                </p>
                {isLatest && (
                  <p className="chalk-text opacity-60 text-xs leading-tight mt-0.5">
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
