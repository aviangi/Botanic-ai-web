import React from 'react';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: 'en' | 'hi' | 'bn';
  setLanguage: (lang: 'en' | 'hi' | 'bn') => void;
  headerTitle: string;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, language, setLanguage, headerTitle }) => {
  return (
    <header className="bg-brand-emerald/80 text-white p-4 shadow-lg sticky top-0 z-10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'en' ? 'bg-brand-jade text-brand-emerald' : 'text-white hover:bg-white/20'}`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'hi' ? 'bg-brand-jade text-brand-emerald' : 'text-white hover:bg-white/20'}`}
              aria-label="Switch to Hindi"
            >
              HI
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${language === 'bn' ? 'bg-brand-jade text-brand-emerald' : 'text-white hover:bg-white/20'}`}
              aria-label="Switch to Bengali"
            >
              BN
            </button>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mx-auto">
          <span className="text-brand-jade">{headerTitle}</span> AI
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-brand-jade hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-emerald focus:ring-white transition-colors duration-200 absolute right-0 top-1/2 -translate-y-1/2"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};

export default Header;