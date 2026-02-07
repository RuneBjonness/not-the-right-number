import { useState, useEffect, useCallback } from 'react';

interface NumberInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  maxDigits?: number;
}

export function NumberInput({ onSubmit, disabled = false, maxDigits = 6 }: NumberInputProps) {
  const [value, setValue] = useState('');
  const [lastSubmitted, setLastSubmitted] = useState('');

  const appendDigit = useCallback(
    (digit: string) => {
      if (disabled) return;
      setValue((prev) => (prev.length < maxDigits ? prev + digit : prev));
    },
    [disabled, maxDigits]
  );

  const clear = useCallback(() => {
    if (disabled) return;
    setValue('');
  }, [disabled]);

  const backspace = useCallback(() => {
    if (disabled) return;
    setValue((prev) => prev.slice(0, -1));
  }, [disabled]);

  const submit = useCallback(() => {
    if (disabled || !value) return;
    setLastSubmitted(value);
    onSubmit(value);
    setValue('');
  }, [disabled, value, onSubmit]);

  // Keyboard support for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, appendDigit, submit, backspace, clear]);

  const numpadButtons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['C', '0', '='],
  ];

  const handleButtonClick = (btn: string) => {
    if (btn === 'C') {
      clear();
    } else if (btn === '=') {
      submit();
    } else {
      appendDigit(btn);
    }
  };

  const getButtonClass = (btn: string) => {
    if (btn === 'C') return 'calc-button calc-button-clear';
    if (btn === '=') return 'calc-button calc-button-submit';
    return 'calc-button';
  };

  return (
    <div className="calculator-panel" data-tutorial="input">
      {/* Display */}
      <div className="calc-display">
        <span className="calc-display-previous">
          {lastSubmitted ? `Ans: ${lastSubmitted}` : ''}
        </span>
        <span className={`calc-display-current ${value ? '' : 'opacity-40'}`}>
          {value || '0'}
        </span>
      </div>

      {/* Numpad Grid */}
      <div className="grid grid-cols-3 gap-2">
        {numpadButtons.flat().map((btn) => (
          <button
            key={btn}
            type="button"
            className={getButtonClass(btn)}
            onClick={() => handleButtonClick(btn)}
            disabled={disabled || (btn === '=' && !value)}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
