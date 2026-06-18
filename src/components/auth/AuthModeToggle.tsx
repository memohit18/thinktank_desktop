'use client';

type AuthModeToggleProps = {
  mode: 'login' | 'signup';
  onChange: (mode: 'login' | 'signup') => void;
};

export default function AuthModeToggle({ mode, onChange }: AuthModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Authentication mode"
      className="mb-6 flex rounded-xl border border-border bg-muted p-1"
    >
      <button
        type="button"
        onClick={() => onChange('login')}
        aria-pressed={mode === 'login'}
        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
          mode === 'login'
            ? 'bg-accent text-accent-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => onChange('signup')}
        aria-pressed={mode === 'signup'}
        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
          mode === 'signup'
            ? 'bg-accent text-accent-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}
