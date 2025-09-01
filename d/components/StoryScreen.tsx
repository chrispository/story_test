'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Choice {
  id: string
  text: string
}

interface StoryScreenProps {
  genre: string
  onBack: () => void
}

export default function StoryScreen({ genre, onBack }: StoryScreenProps) {
  const [storyText, setStoryText] = useState('')
  const [choices, setChoices] = useState<Choice[]>([])
  const [images, setImages] = useState({ portrait: '', landscape: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [screenId, setScreenId] = useState('')

  useEffect(() => {
    loadStory()
  }, [genre])

  const loadStory = async (choiceId?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, choiceId, screenId })
      })
      
      const data = await response.json()
      setStoryText(data.storyText)
      setChoices(data.choices)
      setImages(data.images)
      setScreenId(data.screenId)
    } catch (error) {
      console.error('Failed to load story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChoice = (choiceId: string) => {
    loadStory(choiceId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 dark:from-black dark:via-purple-950/20 dark:to-black">
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 p-3 glass rounded-full hover:scale-110 transition-transform flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </motion.div>
          ) : (
            <motion.div
              key={screenId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-12"
            >
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-2xl p-8"
                >
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {storyText}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  {choices.map((choice, index) => (
                    <motion.button
                      key={choice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(choice.id)}
                      className="w-full glass p-4 rounded-xl text-left hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="text-purple-400 mr-3">{index + 1}.</span>
                      {choice.text}
                    </motion.button>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative aspect-[3/4] lg:aspect-[4/3] rounded-2xl overflow-hidden glass"
              >
                {images.landscape ? (
                  <Image
                    src={images.landscape}
                    alt="Story scene"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50" />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}