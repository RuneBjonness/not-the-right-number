import type { Test, TestResult } from '../engine/types';

interface TestListProps {
  activeTests: Test[];
  testResults: TestResult[];
}

export function TestList({ activeTests, testResults }: TestListProps) {
  const getTestStatus = (testId: string): 'pending' | 'passed' | 'failed' => {
    const result = testResults.find((r) => r.test.id === testId);
    if (!result) return 'pending';
    return result.passed ? 'passed' : 'failed';
  };

  const getStatusIcon = (status: 'pending' | 'passed' | 'failed') => {
    switch (status) {
      case 'passed':
        return <span style={{ color: 'var(--chalk-green)' }}>&#10003;</span>;
      case 'failed':
        return <span style={{ color: 'var(--chalk-red)' }}>&#10007;</span>;
      default:
        return <span className="chalk-text opacity-50">&#9675;</span>;
    }
  };

  const getCardClass = (status: 'pending' | 'passed' | 'failed') => {
    switch (status) {
      case 'passed':
        return 'test-card test-card-passed';
      case 'failed':
        return 'test-card test-card-failed';
      default:
        return 'test-card test-card-pending';
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-bold chalk-text-strong mb-3">
        Rules ({activeTests.length})
      </h2>
      <div className="space-y-2">
        {activeTests.map((test, index) => {
          const status = getTestStatus(test.id);
          const isNew = index === activeTests.length - 1 && testResults.length > 0;

          return (
            <div
              key={test.id}
              className={`${getCardClass(status)} ${isNew ? 'animate-chalk-appear' : ''} flex items-center gap-3`}
            >
              <div className="flex-shrink-0 w-6 text-center text-2xl">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl chalk-text">{test.name}</p>
                <p className="text-base chalk-text opacity-60">{test.description}</p>
              </div>
              <div className="flex-shrink-0 chalk-text opacity-50 text-lg">
                #{index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
