"use client"

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import GenreSelection from '@/components/GenreSelection';
import StoryDisplay from '@/components/StoryDisplay';

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleReset = () => {
    setSelectedGenre(null);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 dark:from-black dark:via-gray-900 dark:to-black">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-gradient" />
      
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/50 transition-all"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-blue-400" />
        )}
      </button>

      <div className="relative z-10">
        {!selectedGenre ? (
          <GenreSelection onSelect={handleGenreSelect} />
        ) : (
          <StoryDisplay genre={selectedGenre} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}