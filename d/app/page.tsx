'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Rocket, Cpu, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import StoryScreen from '@/components/StoryScreen'

type Genre = 'military_scifi' | 'space_opera' | 'space_tech_thriller' | null

export default function Home() {
  const [genre, setGenre] = useState<Genre>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const genres = [
    {
      id: 'military_scifi' as Genre,
      title: 'Military Sci-Fi',
      icon: Rocket,
      gradient: 'from-red-500 to-orange-500',
      description: 'Command starships and lead galactic warfare'
    },
    {
      id: 'space_opera' as Genre,
      title: 'Space Opera',
      icon: Sparkles,
      gradient: 'from-purple-500 to-pink-500',
      description: 'Epic adventures across the cosmos'
    },
    {
      id: 'space_tech_thriller' as Genre,
      title: 'Space Tech Thriller',
      icon: Cpu,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Uncover technological mysteries in deep space'
    }
  ]

  if (genre) {
    return <StoryScreen genre={genre} onBack={() => setGenre(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 dark:from-black dark:via-purple-950/30 dark:to-black animate-gradient">
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 glass rounded-full hover:scale-110 transition-transform"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </button>

      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-gradient">AI Story Adventure</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your genre and begin your journey
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <AnimatePresence>
            {genres.map((g, index) => (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsLoading(true)
                  setGenre(g.id)
                }}
                className="glass p-8 rounded-2xl group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${g.gradient} opacity-0 group-hover:opacity-20 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${g.gradient} rounded-2xl flex items-center justify-center`}>
                    <g.icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold mb-3">{g.title}</h3>
                  <p className="text-muted-foreground">{g.description}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}