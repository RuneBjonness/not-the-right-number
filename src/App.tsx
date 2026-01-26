import { NumberInput } from './components/NumberInput';
import { TestList } from './components/TestList';
import { useGameState } from './hooks/useGameState';

function App() {
  const { gameState, testResults, submitInput, giveUp, resetGame } = useGameState();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Not The Right Number</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Enter numbers that satisfy all the rules. Each success adds a new rule
        that your current number breaks!
      </p>

      {/* Score Display */}
      <div className="mb-6 text-center">
        <p className="text-gray-400 text-sm">Score</p>
        <p className="text-5xl font-bold text-blue-400">{gameState.score}</p>
      </div>

      {/* Input Section */}
      <div className="mb-8 w-full flex flex-col items-center">
        <NumberInput onSubmit={submitInput} disabled={gameState.isGameOver} />

        <div className="flex gap-3 mt-4">
          {!gameState.isGameOver ? (
            <button
              onClick={giveUp}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300
                         rounded-lg transition-colors text-sm"
            >
              Give Up
            </button>
          ) : (
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white
                         font-semibold rounded-lg transition-colors"
            >
              Play Again
            </button>
          )}
        </div>
      </div>

      {/* Game Over Message */}
      {gameState.isGameOver && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700 text-center">
          <p className="text-xl font-semibold text-yellow-400">Game Over!</p>
          <p className="text-gray-400">
            You passed {gameState.score} test{gameState.score !== 1 ? 's' : ''}!
          </p>
        </div>
      )}

      {/* Test List */}
      <TestList activeTests={gameState.activeTests} testResults={testResults} />
    </div>
  );
}

export default App;
