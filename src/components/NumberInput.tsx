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
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Enter a number..."
        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg
                   text-white text-lg placeholder-gray-500
                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                   rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
}
