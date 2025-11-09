import React from 'react';
export default function ThemeSwitcher({ theme, setTheme }) {
  const themes = ['Historical', 'Sci-Fi', 'Cultural'];

  return (
    <div className="flex items-center gap-2 p-2">
      <label className="text-sm mr-2">Theme</label>
      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`px-3 py-1 rounded ${
              theme === t ? 'bg-white text-black' : 'bg-white/10 text-white'
            }`}
            aria-pressed={theme === t}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

