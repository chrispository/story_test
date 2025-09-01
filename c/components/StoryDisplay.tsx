"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';

interface StoryDisplayProps {
  genre: string;
  onReset: () => void;
}

export default function StoryDisplay({ genre, onReset }: StoryDisplayProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [sceneNumber, setSceneNumber] = useState(0);
  const [currentScene, setCurrentScene] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    generateScene();
  }, []);

  const generateScene = async (choice?: string) => {
    setLoading(true);
    try {
      const storyResponse = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre,
          sessionId,
          sceneNumber,
          choice
        })
      });

      const storyData = await storyResponse.json();
      
      if (storyData.success) {
        setCurrentScene(storyData);
        setSessionId(storyData.sessionId);
        
        const imageResponse = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sceneContent: storyData.content,
            genre,
            storyId: storyData.storyId,
            orientation
          })
        });

        const imageData = await imageResponse.json();
        if (imageData.success) {
          setImageUrl(imageData.imageUrl);
        }
      }
    } catch (error) {
      console.error('Error generating scene:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (choice: string) => {
    setSceneNumber(prev => prev + 1);
    generateScene(choice);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
          filter: 'brightness(0.3) blur(2px)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Loader2 className="w-12 h-12 animate-spin text-white" />
            </motion.div>
          ) : currentScene && (
            <motion.div
              key={sceneNumber}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl w-full"
            >
              <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="prose prose-invert max-w-none mb-8"
                >
                  <p className="text-lg leading-relaxed text-gray-100">
                    {currentScene.content}
                  </p>
                </motion.div>

                <div className="space-y-3">
                  {currentScene.choices?.map((choice: string, index: number) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(choice)}
                      className="w-full group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300" />
                      <div className="relative flex items-center justify-between p-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm hover:border-white/40 transition-all duration-300">
                        <span className="text-left text-gray-100">{choice}</span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onReset}
                className="mt-6 mx-auto block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Start New Adventure
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}