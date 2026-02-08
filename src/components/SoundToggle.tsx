import { useSoundStore } from '../stores/soundStore';

export function SoundToggle() {
  const { soundEnabled, musicEnabled, toggleSound, toggleMusic } = useSoundStore();

  return (
    <div className="absolute top-3 right-3 flex gap-2 z-10">
      <button
        onClick={toggleSound}
        className="text-2xl chalk-text opacity-30 hover:opacity-80 transition-opacity"
        title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
        aria-label={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
      >
        <span className="relative inline-block">
          🔊
          {!soundEnabled && (
            <span
              className="absolute left-[-2px] right-[-2px] top-1/2 h-[2px] -rotate-45"
              style={{ background: 'var(--chalk-red)' }}
            />
          )}
        </span>
      </button>
      <button
        onClick={toggleMusic}
        className="text-2xl chalk-text opacity-30 hover:opacity-80 transition-opacity"
        title={musicEnabled ? 'Mute music' : 'Unmute music'}
        aria-label={musicEnabled ? 'Mute music' : 'Unmute music'}
      >
        <span className="relative inline-block">
          ♫
          {!musicEnabled && (
            <span
              className="absolute left-[-2px] right-[-2px] top-1/2 h-[2px] -rotate-45"
              style={{ background: 'var(--chalk-red)' }}
            />
          )}
        </span>
      </button>
    </div>
  );
}
