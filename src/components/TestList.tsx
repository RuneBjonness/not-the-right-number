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

  const getStatusIcon = (status: 'pending' | 'passed' | 'failed', isLatest: boolean) => {
    const sizeClass = isLatest ? 'text-3xl' : 'text-xl';
    switch (status) {
      case 'passed':
        return <span className={sizeClass} style={{ color: 'var(--chalk-green)' }}>&#10003;</span>;
      case 'failed':
        return <span className={sizeClass} style={{ color: 'var(--chalk-red)' }}>&#10007;</span>;
      default:
        return <span className={`chalk-text opacity-50 ${sizeClass}`}>&#9675;</span>;
    }
  };

  const getCardClass = (status: 'pending' | 'passed' | 'failed', isLatest: boolean) => {
    const baseClass = isLatest ? 'test-card-latest' : 'test-card';
    switch (status) {
      case 'passed':
        return `${baseClass} test-card-passed`;
      case 'failed':
        return `${baseClass} test-card-failed`;
      default:
        return `${baseClass} test-card-pending`;
    }
  };

  // Display newest rules first
  const reversedTests = [...activeTests].reverse();

  return (
    <div className="w-full max-w-xl">
      <h2 className="text-2xl font-bold chalk-text-strong mb-2 md:text-3xl">
        Rules ({activeTests.length})
      </h2>
      <div className="space-y-2">
        {reversedTests.map((test, reversedIndex) => {
          const originalIndex = activeTests.length - 1 - reversedIndex;
          const status = getTestStatus(test.id);
          const isLatest = reversedIndex === 0;
          const isNew = isLatest && testResults.length > 0;

          return (
            <div
              key={test.id}
              className={`${getCardClass(status, isLatest)} ${isNew ? 'animate-chalk-appear' : ''} flex items-center gap-3`}
            >
              <div className="flex-shrink-0 w-8 text-center">
                {getStatusIcon(status, isLatest)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`chalk-text ${isLatest ? 'text-xl md:text-2xl font-semibold' : 'text-base md:text-lg'}`}>
                  {test.name}
                </p>
                <p className={`chalk-text opacity-60 ${isLatest ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>
                  {test.description}
                </p>
              </div>
              <div className={`flex-shrink-0 chalk-text opacity-50 ${isLatest ? 'text-lg' : 'text-sm'}`}>
                #{originalIndex + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
