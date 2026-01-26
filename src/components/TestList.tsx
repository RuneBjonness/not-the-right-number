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
        return <span className="text-green-500 text-xl">✓</span>;
      case 'failed':
        return <span className="text-red-500 text-xl">✗</span>;
      default:
        return <span className="text-gray-500 text-xl">○</span>;
    }
  };

  const getStatusClass = (status: 'pending' | 'passed' | 'failed') => {
    switch (status) {
      case 'passed':
        return 'border-green-500/30 bg-green-500/10';
      case 'failed':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-gray-700 bg-gray-800/50';
    }
  };

  return (
    <div className="w-full max-w-md space-y-2">
      <h2 className="text-lg font-semibold text-gray-300 mb-3">
        Active Rules ({activeTests.length})
      </h2>
      <div className="space-y-2">
        {activeTests.map((test, index) => {
          const status = getTestStatus(test.id);
          const isNew = index === activeTests.length - 1 && testResults.length > 0;

          return (
            <div
              key={test.id}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all duration-300
                ${getStatusClass(status)}
                ${isNew ? 'animate-pulse' : ''}
              `}
            >
              <div className="flex-shrink-0 w-6 text-center">
                {getStatusIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{test.name}</p>
                <p className="text-gray-400 text-sm truncate">{test.description}</p>
              </div>
              <div className="flex-shrink-0 text-gray-500 text-sm">
                #{index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
