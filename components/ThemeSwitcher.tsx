import React from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  const themes: { name: Theme, icon: string, label: string }[] = [
    { name: 'light', icon: '☀️', label: 'Light' },
    { name: 'dark', icon: '🌙', label: 'Dark' },
    { name: 'system', icon: '💻', label: 'System' }
  ];

  return (
    <div>
      <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
        {themes.map(t => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`w-full flex justify-center items-center gap-2 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              theme === t.name 
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-900/50'
            }`}
            aria-pressed={theme === t.name}
            aria-label={`Set theme to ${t.name}`}
          >
            <span role="img" aria-hidden="true">{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
