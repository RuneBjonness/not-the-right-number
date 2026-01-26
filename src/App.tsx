import { NumberInput } from './components/NumberInput';
import { TestList } from './components/TestList';
import { useGameState } from './hooks/useGameState';

function App() {
  const { gameState, testResults, submitInput, giveUp, resetGame } = useGameState();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8">
      <h1 className="text-6xl font-bold mb-2 chalk-text-strong">Not The Right Number</h1>
      <p className="text-xl mb-8 text-center max-w-md chalk-text opacity-80">
        Enter numbers that satisfy all the rules. Each success adds a new rule
        that your current number breaks!
      </p>

      {/* Score Display */}
      <div className="mb-6 text-center">
        <p className="text-lg chalk-text opacity-70">Score</p>
        <p className="text-7xl font-bold chalk-glow" style={{ color: 'var(--chalk-yellow)' }}>
          {gameState.score}
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-8 w-full flex flex-col items-center">
        <NumberInput onSubmit={submitInput} disabled={gameState.isGameOver} />

        <div className="flex gap-3 mt-4">
          {!gameState.isGameOver ? (
            <button onClick={giveUp} className="chalk-button">
              Give Up
            </button>
          ) : (
            <button onClick={resetGame} className="chalk-button chalk-button-success">
              Play Again
            </button>
          )}
        </div>
      </div>

      {/* Game Over Message */}
      {gameState.isGameOver && (
        <div className="mb-6 p-4 test-card text-center animate-chalk-appear">
          <p className="text-3xl font-bold chalk-glow" style={{ color: 'var(--chalk-yellow)' }}>
            Game Over!
          </p>
          <p className="text-xl chalk-text opacity-80">
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
