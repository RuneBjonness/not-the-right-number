import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface NumberInputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function NumberInput({ onSubmit, disabled = false }: NumberInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Enter a number..."
        className="chalk-input flex-1 disabled:opacity-50 text-2xl md:text-3xl text-center"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="chalk-button chalk-button-primary text-xl py-1 px-2"
      >
        &#10003;
      </button>
    </form>
  );
}
